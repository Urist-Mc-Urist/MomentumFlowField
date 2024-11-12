import React, { useEffect, useRef } from 'react';

export const GameCanvas = ({ 
  gameState = {  // Add default prop value
    playerPaddleY: 150,
    aiPaddleY: 150,
    ballX: 400,
    ballY: 200,
    score: 0,
    computerScore: 0
  },

  getCurrentBehavior = () => 'NEUTRAL',  // Add default for getCurrentBehavior
  gameWidth = 800,
  gameHeight = 400,
  paddleWidth = 10,
  paddleHeight = 60,
  ballSize = 8
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return; // Add guard clause
    
    const ctx = canvas.getContext('2d');
    
    const drawGame = () => {
      ctx.clearRect(0, 0, gameWidth, gameHeight);
      
      // Draw paddles
      ctx.fillStyle = 'white';
      ctx.fillRect(0, gameState.playerPaddleY, paddleWidth, paddleHeight);
      ctx.fillRect(gameWidth - paddleWidth, gameState.aiPaddleY, paddleWidth, paddleHeight);
      
      // Draw ball
      ctx.fillRect(gameState.ballX, gameState.ballY, ballSize, ballSize);
      
      // Draw scores
      ctx.font = '24px Arial';
      ctx.fillText(gameState.score, gameWidth / 4, 30);
      ctx.fillText(gameState.computerScore, 3 * gameWidth / 4, 30);

      // Draw current behavior state
      ctx.font = '14px Arial';
      const formattedBehavior = Number(getCurrentBehavior()).toFixed(3);
      ctx.fillText(`Behavior: ${formattedBehavior}`, 10, gameHeight - 10);
    };
    
    drawGame();
  }, [gameState, getCurrentBehavior, gameWidth, gameHeight, paddleWidth, paddleHeight, ballSize]);

  return (
    <canvas
      ref={canvasRef}
      width={gameWidth}
      height={gameHeight}
      className="border border-gray-200 bg-gray-900"
    />
  );
};