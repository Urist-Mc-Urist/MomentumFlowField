import React, { useEffect, useRef } from 'react';
import { Card } from './ui/card';

export const VectorField = ({ 
  position, 
  velocity, 
  trajectory, 
  vectorField, 
  getCurrentBehavior,
  gridSize = 64,  // Updated default to 64
  cellSize = 10,
  warmup,
  mirror,
  mirrorPaddle
}) => {
  const canvasRef = useRef(null);

  // Helper function to check if two points need a line break due to wrapping
  const needsLineBreak = (p1, p2) => {
    const threshold = gridSize / 2;
    return Math.abs(p1[0] - p2[0]) > threshold || 
           Math.abs(p1[1] - p2[1]) > threshold;
  };

  // Helper function to draw a trajectory segment with proper styling
  const drawTrajectorySegment = (ctx, points, isGlow = false) => {
    if (points.length < 2) return;
    
    if (isGlow) {
      ctx.strokeStyle = 'rgba(64, 156, 255, 0.3)';
      ctx.lineWidth = 4;
    } else {
      ctx.strokeStyle = 'rgba(64, 156, 255, 0.8)';
      ctx.lineWidth = 2;
    }

    ctx.beginPath();
    ctx.moveTo(points[0][0] * cellSize, points[0][1] * cellSize);
    
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1];
      
      if (needsLineBreak(prev, curr)) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(curr[0] * cellSize, curr[1] * cellSize);
      } else {
        ctx.lineTo(curr[0] * cellSize, curr[1] * cellSize);
      }
    }
    ctx.stroke();
  };

  // Helper function to draw an arrow
  const drawArrow = (ctx, x, y, dx, dy, magnitude) => {
    const headLength = 4;  // Slightly smaller arrow head for denser grid
    const angle = Math.atan2(dy, dx);
    
    // Calculate end point with shorter length for denser grid
    const endX = x + dx * cellSize;
    const endY = y + dy * cellSize;
    
    // Draw main line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(0, 255, 128, 0.15)');
      gradient.addColorStop(0.4, 'rgba(128, 128, 128, 0.1)');
      gradient.addColorStop(0.6, 'rgba(128, 128, 128, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 64, 64, 0.15)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw full grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridSize; i++) {
        const alpha = i % 8 === 0 ? 0.2 : 0.1;  // Emphasize every 8th line
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, gridSize * cellSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(gridSize * cellSize, i * cellSize);
        ctx.stroke();
      }
      
      // Draw vector field
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          // Only draw vectors every other cell to reduce density while maintaining grid alignment
          if (x % 2 === 0 && y % 2 === 0) {
            const [dx, dy] = vectorField[x][y];
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            // Enhanced visibility for vectors
            const alpha = Math.min(0.9, 0.3 + magnitude * 0.6);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1;
            
            drawArrow(
              ctx,
              x * cellSize,
              y * cellSize,
              dx,
              dy,
              magnitude
            );
          }
        }
      }
      
      // Draw trajectory
      if (trajectory.length > 1) {
        drawTrajectorySegment(ctx, trajectory, true);
        drawTrajectorySegment(ctx, trajectory, false);
      }
      
      // Draw current position
      ctx.shadowColor = 'rgba(64, 156, 255, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#4099ff';
      ctx.beginPath();
      ctx.arc(position[0] * cellSize, position[1] * cellSize, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      // Draw velocity vector
      const velocityMagnitude = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
      ctx.strokeStyle = 'rgba(255, 64, 64, 0.8)';
      ctx.lineWidth = 2;
      drawArrow(
        ctx,
        position[0] * cellSize,
        position[1] * cellSize,
        velocity[0],
        velocity[1],
        velocityMagnitude
      );

      // Draw behavior state
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(10, gridSize * cellSize - 40, 100, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, system-ui, sans-serif';
      const formattedBehavior = Number(getCurrentBehavior()).toFixed(3);
      ctx.fillText(`State: ${formattedBehavior}`, 15, gridSize * cellSize - 20);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(120, gridSize * cellSize - 40, 100, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillText(`Warmup: ${warmup}`, 125, gridSize * cellSize - 20);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(230, gridSize * cellSize - 40, 110, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillText(`Mirror ball: ${mirror}`, 235, gridSize * cellSize - 20);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(350, gridSize * cellSize - 40, 125, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillText(`Mirror paddle: ${mirrorPaddle}`, 355, gridSize * cellSize - 20);
    };
    
    draw();
  }, [position, velocity, trajectory, vectorField, getCurrentBehavior, gridSize, cellSize, warmup, mirror]);

  return (
    <Card className="bg-gray-950">
      <canvas
        ref={canvasRef}
        width={gridSize * cellSize}
        height={gridSize * cellSize}
        className="rounded-lg"
      />
    </Card>
  );
};

export default VectorField;