// src/components/gameLogic.js

import { useState, useCallback } from 'react';

const DEFAULT_PARAMS = {
  baseSpeed: 5,
  paddleSpeed: 5,
  rewardMultiplier: 1,
};

const DEFAULT_DIMENSIONS = {
  gameWidth: 800,
  gameHeight: 400,
  paddleWidth: 10,
  paddleHeight: 60,
  ballSize: 8,
};

export const createInitialState = (params = {}, dimensions = {}) => {
  const gameParams = { ...DEFAULT_PARAMS, ...params };
  const gameDimensions = { ...DEFAULT_DIMENSIONS, ...dimensions };

  return {
    playerPaddleY:
      gameDimensions.gameHeight / 2 - gameDimensions.paddleHeight / 2,
    aiPaddleY:
      gameDimensions.gameHeight / 2 - gameDimensions.paddleHeight / 2,
    ballX: gameDimensions.paddleWidth * 2,
    ballY: gameDimensions.gameHeight / 2,
    ballVelX: gameParams.baseSpeed,
    ballVelY: (Math.random() - 0.5) * 6,
    score: 0,
    computerScore: 0,
    lastPaddleHit: 0,
    consecutiveHits: 0,
    servingPlayer: 'player',
    isResetting: false,
    lastResetTime: 0, // Added lastResetTime to the initial state
  };
};

const resetBall = (state, gameWidth, gameHeight, initialVelX, paddleWidth, paddleHeight, ballSize) => {
  const isPlayerServing = state.servingPlayer === 'player';

  // Generate a random non-zero vertical velocity
  let ballVelY = (Math.random() - 0.5) * 6;
  if (ballVelY === 0) {
    ballVelY = 1;
  }

  return {
    ...state,
    ballX: isPlayerServing ? paddleWidth * 2 + ballSize : gameWidth - (paddleWidth * 2) - ballSize,
    ballY: gameHeight / 2 - ballSize / 2,
    ballVelX: initialVelX,
    ballVelY: ballVelY,
    lastPaddleHit: Date.now(),
    isResetting: true
  };
};

const normalizeVelocity = (velX, velY, targetSpeed) => {
  const currentSpeed = Math.sqrt(velX * velX + velY * velY);
  if (currentSpeed === 0) {
    return {
      x: velX === 0 ? targetSpeed : (velX / Math.abs(velX)) * targetSpeed,
      y: 0
    };
  }
  return {
    x: (velX / currentSpeed) * targetSpeed,
    y: (velY / currentSpeed) * targetSpeed
  };
};

const predictBallPosition = (
  state,
  gameWidth,
  gameHeight,
  ballSize
) => {
  let predictedY = state.ballY;
  let predictedVelY = state.ballVelY;
  let steps = (gameWidth - state.ballX) / Math.abs(state.ballVelX);

  while (steps > 0) {
    predictedY += predictedVelY;
    if (predictedY <= 0 || predictedY >= gameHeight - ballSize) {
      predictedVelY *= -1;
      predictedY = Math.max(
        0,
        Math.min(gameHeight - ballSize, predictedY)
      );
    }
    steps--;
  }

  return predictedY;
};

export const updateGameState = (
  prevState,
  getCurrentBehavior,
  params,
  gameWidth,
  gameHeight,
  paddleWidth,
  paddleHeight,
  ballSize,
  applyReward
) => {
  if (prevState.isResetting) {
    if (Date.now() - prevState.lastPaddleHit < 200) {
      return prevState;
    }
    return { ...prevState, isResetting: false };
  }

  const newState = { ...prevState };
  const now = Date.now();

  // Calculate ball speed based on rally length
  const baseSpeed = params.baseSpeed || DEFAULT_PARAMS.baseSpeed;
  const speedMultiplier =
    1 + Math.min(newState.consecutiveHits, 10) * 0.1;
  const currentSpeed = baseSpeed * speedMultiplier;

  // Normalize ball velocity
  const velocity = normalizeVelocity(
    newState.ballVelX,
    newState.ballVelY,
    currentSpeed
  );
  newState.ballVelX = velocity.x;
  newState.ballVelY = velocity.y;

  // Move ball
  newState.ballX += newState.ballVelX;
  newState.ballY += newState.ballVelY;

  // Ball collision with top/bottom
  if (
    newState.ballY <= 0 ||
    newState.ballY >= gameHeight - ballSize
  ) {
    newState.ballVelY *= -1;
    newState.ballY = Math.max(
      0,
      Math.min(gameHeight - ballSize, newState.ballY)
    );
  }

  // Ball collision with player paddle
  if (
    newState.ballX <= paddleWidth &&
    newState.ballY >= newState.playerPaddleY &&
    newState.ballY <= newState.playerPaddleY + paddleHeight &&
    now - newState.lastPaddleHit > 100
  ) {
    const relativeIntersectY =
      newState.playerPaddleY + paddleHeight / 2 - newState.ballY;
    const normalizedIntersectY =
      relativeIntersectY / (paddleHeight / 2);
    const bounceAngle = (normalizedIntersectY * Math.PI) / 3;

    newState.ballVelX = currentSpeed * Math.cos(bounceAngle);
    newState.ballVelY = currentSpeed * -Math.sin(bounceAngle);
    newState.lastPaddleHit = now;
    newState.consecutiveHits++;

    applyReward(true, params, true);
  }

  // Ball collision with AI paddle
  if (
    newState.ballX >= gameWidth - paddleWidth - ballSize &&
    newState.ballY >= newState.aiPaddleY &&
    newState.ballY <= newState.aiPaddleY + paddleHeight &&
    now - newState.lastPaddleHit > 100
  ) {
    const relativeIntersectY =
      newState.aiPaddleY + paddleHeight / 2 - newState.ballY;
    const normalizedIntersectY =
      relativeIntersectY / (paddleHeight / 2);
    const bounceAngle = (normalizedIntersectY * Math.PI) / 3;

    newState.ballVelX = -currentSpeed * Math.cos(bounceAngle);
    newState.ballVelY = currentSpeed * -Math.sin(bounceAngle);
    newState.lastPaddleHit = now;
    newState.consecutiveHits++;
  }

  // Ball out of bounds - player loses point
  if (newState.ballX <= -ballSize) {
    newState.computerScore += 1;
    newState.consecutiveHits = 0;
    newState.servingPlayer = 'player';
    applyReward(false, params);
    return resetBall(
      newState,
      gameWidth,
      gameHeight,
      params.baseSpeed,
      paddleWidth,
      paddleHeight,
      ballSize
    );
  }

  // Ball out of bounds - AI loses point
  if (newState.ballX >= gameWidth + ballSize) {
    newState.score += 1;
    newState.consecutiveHits = 0;
    newState.servingPlayer = 'computer';
    return resetBall(
      newState,
      gameWidth,
      gameHeight,
      -params.baseSpeed,
      paddleWidth,
      paddleHeight,
      ballSize
    );
  }

  // AI paddle movement
  const aiDifficulty = Math.min(
    0.7 + newState.consecutiveHits * 0.02,
    0.95
  );
  const predictedY = predictBallPosition(
    newState,
    gameWidth,
    gameHeight,
    ballSize
  );
  const targetY = predictedY - paddleHeight / 2;
  const randomOffset =
    (Math.random() - 0.5) * paddleHeight * (1 - aiDifficulty);
  const aiTargetY = targetY + randomOffset;

  const aiSpeed = params.paddleSpeed * aiDifficulty;
  if (newState.aiPaddleY < aiTargetY) {
    newState.aiPaddleY += aiSpeed;
  } else if (newState.aiPaddleY > aiTargetY) {
    newState.aiPaddleY -= aiSpeed;
  }

  newState.aiPaddleY = Math.max(
    0,
    Math.min(gameHeight - paddleHeight, newState.aiPaddleY)
  );

  // Update player paddle
  const behaviorValue = getCurrentBehavior();
  const paddleMovement = behaviorValue * params.paddleSpeed;
  newState.playerPaddleY = Math.max(
    0,
    Math.min(
      gameHeight - paddleHeight,
      newState.playerPaddleY + paddleMovement
    )
  );

  return newState;
};

export const useGame = (initialParams = {}, dimensions = {}) => {
  const [gameState, setGameState] = useState(
    createInitialState(initialParams, dimensions)
  );

  const resetGame = useCallback(() => {
    setGameState(
      createInitialState(initialParams, dimensions)
    );
  }, [initialParams, dimensions]);

  return {
    gameState,
    setGameState,
    resetGame,
  };
};
