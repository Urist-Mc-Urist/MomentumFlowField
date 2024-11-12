import { useState, useCallback } from 'react';

/**
 * Initialize a vector field with a slight circular tendency
 */
const initializeVectorField = (gridSize) => {
  const field = Array(gridSize).fill().map(() => 
    Array(gridSize).fill().map(() => [0, 0])
  );

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const dx = x - gridSize / 2;
      const dy = y - gridSize / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) continue;
      field[x][y] = [-dy / dist * 0.01, dx / dist * 0.01];
    }
  }
  return field;
};

/**
 * Wrap a coordinate around the grid boundaries
 */
const wrapCoordinate = (value, max) => {
  if (value < 0) return max + (value % max);
  if (value >= max) return value % max;
  return value;
};

/**
 * Updates the consciousness state based on current position, velocity, and ball position
 */
export const updateSystemStateWithBall = (
  position,
  velocity,
  vectorField,
  params,
  gridSize,
  gameState,
) => {
  // Wrap grid coordinates for field influence calculation
  const gridX = Math.floor(wrapCoordinate(position[0], gridSize));
  const gridY = Math.floor(wrapCoordinate(position[1], gridSize));
  
  // Get field influence
  let fieldForce = vectorField[gridX][gridY];
  
  // Add the ball force mirrored

  let ballForce = [0, 0];
  if (params.mirror){
    ballForce = [
      gameState.ballVelY * params.ballInfluence,
      gameState.ballVelX * params.ballInfluence,
    ]
  }else{
    ballForce = [
      gameState.ballVelX * params.ballInfluence,
      gameState.ballVelY * params.ballInfluence,
    ]
  }

  // Add random noise
  const noise = [
    (Math.random() - 0.5) * params.noise,
    (Math.random() - 0.5) * params.noise
  ];

  // Calculate new velocity
  const newVelocity = [
    (velocity[0] + fieldForce[0] * params.fieldStrength + ballForce[0] + noise[0]) * params.drag,
    (velocity[1] + fieldForce[1] * params.fieldStrength + ballForce[1] + noise[1]) * params.drag
  ];

  // Calculate new position with wrapping
  const newPosition = [
    wrapCoordinate(position[0] + newVelocity[0], gridSize),
    wrapCoordinate(position[1] + newVelocity[1], gridSize)
  ];

  return { newPosition, newVelocity };
};

/**
 * Custom hook for managing consciousness state and behavior
 */
export const useMomentumField = (gridSize) => {
  const [position, setPosition] = useState([gridSize / 2, gridSize / 2]);
  const [velocity, setVelocity] = useState([0, 0]);
  const [trajectory, setTrajectory] = useState([]);
  const [vectorField, setVectorField] = useState(() => initializeVectorField(gridSize));

  //calculate the current behavior of the paddle
  const getCurrentBehavior = useCallback(() => {
    // Convert vertical position to a value between -1 and 1
    const normalizedPosition = (position[1] / gridSize) * 2 - 1;
    
    // Define dead zone boundaries (25% of total range)
    const deadZoneSize = 0.25;
    const deadZoneMin = -deadZoneSize;
    const deadZoneMax = deadZoneSize;
    
    // Return 0 if position is within dead zone
    if (normalizedPosition >= deadZoneMin && normalizedPosition <= deadZoneMax) {
      return 0;
    }
    
    // Adjust the range to account for dead zone
    // Map remaining ranges to full -1 to 1 range
    if (normalizedPosition < deadZoneMin) {
      // Map -1 to deadZoneMin => -1 to 0
      return Math.tanh((normalizedPosition - deadZoneMin) / (1 - deadZoneSize) * 2);
    } else {
      // Map deadZoneMax to 1 => 0 to 1
      return Math.tanh((normalizedPosition - deadZoneMax) / (1 - deadZoneSize) * 2);
    }
  }, [position, gridSize]);

  
  const applyReward = useCallback((positive, inputParams, warmupReward) => {
    if (warmupReward && !inputParams.warmup) return;

    const newField = vectorField.map(row => row.map(cell => [...cell]));
    
    const weights = trajectory.map((_, i) => 
      Math.pow(inputParams.decayFactor, trajectory.length - i - 1)
    );
    
    trajectory.forEach(([x, y], i) => {
      if (i === 0) return;
      
      const prevX = Math.floor(wrapCoordinate(trajectory[i-1][0], gridSize));
      const prevY = Math.floor(wrapCoordinate(trajectory[i-1][1], gridSize));
      
      // Calculate shortest distance considering wrapping
      const dx = ((x - trajectory[i-1][0] + gridSize / 2) % gridSize) - gridSize / 2;
      const dy = ((y - trajectory[i-1][1] + gridSize / 2) % gridSize) - gridSize / 2;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      
      if (magnitude === 0) return;
      
      const dirX = dx / magnitude;
      const dirY = dy / magnitude;

      let updateFactor;
      if (positive) {
        updateFactor = inputParams.learningRate;
        if (warmupReward) {
          updateFactor = inputParams.warmupAutoReward;
        }
      }
      else {
        updateFactor = inputParams.negLearningRate;
      }
      
      const update = updateFactor * weights[i] * (positive ? 1 : -1);
      newField[prevX][prevY][0] += dirX * update;
      newField[prevX][prevY][1] += dirY * update;
      
      const fieldMagnitude = Math.sqrt(
        newField[prevX][prevY][0] * newField[prevX][prevY][0] +
        newField[prevX][prevY][1] * newField[prevX][prevY][1]
      );
      if (fieldMagnitude > 1) {
        newField[prevX][prevY][0] /= fieldMagnitude;
        newField[prevX][prevY][1] /= fieldMagnitude;
      }
    });
    
    setVectorField(newField);
  }, [trajectory, vectorField, gridSize]);

  return {
    position,
    setPosition,
    velocity,
    setVelocity,
    trajectory,
    setTrajectory,
    vectorField,
    getCurrentBehavior,
    applyReward
  };
};