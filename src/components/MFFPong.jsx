import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import VectorField from './VectorField';
import { GameCanvas } from './GameCanvas';
import { ControlPanel } from './ControlPanel';
import { useGame, updateGameState } from './gameLogic';
import { updateSystemStateWithBall, useMomentumField } from './MomentumFlowField';

const MFFPong = () => {
  const gridSize = 48;
  const cellSize = 10;
  const gameWidth = 800;
  const gameHeight = 400;
  const paddleWidth = 10;
  const paddleHeight = 60;
  const ballSize = 8;

  const [params, setParams] = useState({
    baseSpeed: 5,
    learningRate: 1,
    negLearningRate: 1,
    decayFactor: 0.99,
    ballInfluence: 0.015,
    noise: 0.25,
    fieldStrength: 0.85,
    drag: 0.75,
    paddleSpeed: 5,
    gameInterval: 1,
    warmup: true,
    warmupAutoReward: 0.001,
    paddleInfluence: 0.1,
    mirror: false,
    mirrorPaddle: true
  });

  const {
    position,
    setPosition,
    velocity,
    setVelocity,
    trajectory,
    setTrajectory,
    vectorField,
    getCurrentBehavior,
    applyReward
  } = useMomentumField(gridSize);

  const {
    gameState,
    setGameState,

  } = useGame();

  useEffect(() => {
    const updateGame = () => {
      setGameState(prev => updateGameState(
        prev,
        getCurrentBehavior,
        params,
        gameWidth,
        gameHeight,
        paddleWidth,
        paddleHeight,
        ballSize,
        applyReward
      ));
    };

    const useMomentumField = () => {
      const { newPosition, newVelocity } = updateSystemStateWithBall(
        position,
        velocity,
        vectorField,
        params,
        gridSize,
        gameState,
        gameWidth,
        gameHeight
      );

      setVelocity(newVelocity);
      setPosition(newPosition);
      setTrajectory(prev => [...prev, newPosition].slice(-100));
    };

    const simInterval = setInterval(() => {
      updateGame();
      useMomentumField();
      applyReward(true, params, true); // Apply warmup reward during warmup
    }, params.gameInterval);
    
    return () => {
      clearInterval(simInterval);
    };
  }, [position, velocity, vectorField, params, getCurrentBehavior, applyReward, gameState]);

  return (
    <Card className="w-screen min-h-screen p-4 flex flex-col items-center justify-between">
      <div className="w-full max-w-7xl flex flex-col items-center">
        {/* Main game area */}
        <div className="flex gap-4 justify-center mb-4">
          <div className="flex flex-col">
            <VectorField
              position={position}
              velocity={velocity}
              trajectory={trajectory}
              vectorField={vectorField}
              getCurrentBehavior={getCurrentBehavior}
              gridSize={gridSize}
              cellSize={cellSize}
              warmup={params.warmup}
              mirror={params.mirror}
              mirrorPaddle={params.mirrorPaddle}
            />
            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                onClick={() => setParams(p => ({...p, warmup: !p.warmup}))}
                className={`bg-orange-50 hover:bg-orange-100 border-orange-50 border-solid
                  ${params.warmup ? 'border-width-2' : 'border-width-0'}
                   p-2 rounded-sm transition-colors duration-300`
                }
              >
                Warmup
              </Button>
              <Button
                variant="outline"
                onClick={() => setParams(p => ({...p, mirror: !p.mirror}))}
                className={`bg-blue-50 hover:bg-orange-100 border-blue-50 border-solid
                  ${params.mirror ? 'border-width-2' : 'border-width-0'}
                   p-2 rounded-sm transition-colors duration-300`
                }
              >
                Mirror ball
              </Button>
              <Button
                variant="outline"
                onClick={() => setParams(p => ({...p, mirrorPaddle: !p.mirrorPaddle}))}
                className={`bg-blue-50 hover:bg-orange-100 border-blue-50 border-solid
                  ${params.mirror ? 'border-width-2' : 'border-width-0'}
                   p-2 rounded-sm transition-colors duration-300`
                }
              >
                Mirror paddle
              </Button>
            </div>
          </div>
          <GameCanvas
            gameState={gameState}
            getCurrentBehavior={getCurrentBehavior}
            gameWidth={gameWidth}
            gameHeight={gameHeight}
            paddleWidth={paddleWidth}
            paddleHeight={paddleHeight}
            ballSize={ballSize}
          />
        </div>
  
        {/* Control panel at bottom */}
        <div className="w-full max-w-3xl">
          <ControlPanel params={params} setParams={setParams} />
        </div>
      </div>

      <Card className="w-screen min-h-screen p-4 flex flex-col items-center justify-between">
        <div className="w-full max-w-7xl flex flex-col items-center">
          {/* Title and Overview */}
          <div className="mb-8 text-center max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Momentum Flow Field Simulation</h1>
            <p className="text-gray-600 mb-6">
              Inspired by viewing the brain as a system with state and momentum, this simulator demonstrates how complex behaviors can emerge from simple dynamic rules. The system learns through reinforcement of successful trajectories in a continuous space, developing sophisticated patterns over time.
            </p>
          </div>

          {/* Core Concept */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8 w-full">
            <h2 className="font-bold text-lg mb-3">Core Concept</h2>
            <p className="text-sm text-gray-700 mb-4">
              The system models behavior as a point moving through a shaped vector field. The point (or "mote") has position and momentum, and its movement patterns emerge from:
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-700 mb-4 space-y-2">
              <li>Direct influences from game inputs (ball velocity)</li>
              <li>Learned patterns encoded in the vector field</li>
              <li>Natural momentum and physics-like behavior</li>
              <li>Small random perturbations to prevent stagnation</li>
            </ul>
            <p className="text-sm text-gray-700">
              During warmup, the system only receives positive reinforcement for successful actions, allowing it to develop natural movement patterns without being constrained by penalties. This encourages exploration and the formation of dynamic behavioral circuits.
            </p>
          </div>

          {/* Parameters */}
          <div className="bg-gray-50 p-6 rounded-lg w-full">
            <h2 className="font-bold text-lg mb-4">System Parameters</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-md">Learning Parameters</h3>
                <ul className="space-y-3">
                  <li className="text-sm">
                    <span className="font-medium">Learning Rate:</span>
                    <p className="text-gray-600">Controls how strongly successful trajectories reshape the vector field. Higher values mean faster adaptation but potentially less stable patterns.</p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Path Update Decay:</span>
                    <p className="text-gray-600">Determines how much recent actions are emphasized when reinforcing successful paths. Higher values create stronger immediate learning from recent success.</p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Field Strength:</span>
                    <p className="text-gray-600">How strongly the learned vector field influences movement. Balances between learned patterns and reactive behavior.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-md">Dynamic Parameters</h3>
                <ul className="space-y-3">
                  <li className="text-sm">
                    <span className="font-medium">Noise Level:</span>
                    <p className="text-gray-600">Random perturbations that prevent the system from getting stuck in local patterns and encourage exploration.</p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Drag:</span>
                    <p className="text-gray-600">Resistance to movement that prevents overshooting and creates more controlled transitions between states.</p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Ball Velocity Influence:</span>
                    <p className="text-gray-600">How strongly ball movement affects the system state. Higher values create more reactive behavior, while lower values rely more on learned patterns.</p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Time Step:</span>
                    <p className="text-gray-600">Simulation update interval. Smaller steps run the simulation faster.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Emergent Behaviors */}
          <div className="mt-8 bg-green-50 p-6 rounded-lg w-full">
            <h2 className="font-bold text-lg mb-3">Emergent Behaviors</h2>
            <p className="text-sm text-gray-700 mb-4">
              As the system learns, you may observe:
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-2">
              <li>Evolution from simple ball-tracking to complex movement patterns</li>
              <li>Formation of "behavioral circuits" for common game situations</li>
              <li>Development of different strategies for different scenarios</li>
              <li>Natural reaction times and smooth transitions between behaviors</li>
              <li>Ability to recover from suboptimal patterns through exploration</li>
            </ul>
          </div>
        </div>
    </Card>
    </Card>
  );
};

export default MFFPong;