import React from 'react';
import { Slider } from './ui/slider';

export const ControlPanel = ({ params, setParams }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Positive Learning Rate: {params.learningRate.toFixed(3)}</p>
        <Slider 
          value={[params.learningRate]}
          min={0}
          max={10}
          step={0.01}
          onValueChange={([v]) => setParams(p => ({...p, learningRate: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Negative Learning Rate: {params.negLearningRate.toFixed(3)}</p>
        <Slider 
          value={[params.negLearningRate]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => setParams(p => ({...p, negLearningRate: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Path Update Decay Factor: {params.decayFactor.toFixed(3)}</p>
        <Slider 
          value={[params.decayFactor]}
          min={0.9}
          max={0.9999}
          step={0.0001}
          onValueChange={([v]) => setParams(p => ({...p, decayFactor: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Noise Level: {params.noise.toFixed(2)}</p>
        <Slider 
          value={[params.noise]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={([v]) => setParams(p => ({...p, noise: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Field Strength: {params.fieldStrength.toFixed(2)}</p>
        <Slider 
          value={[params.fieldStrength]}
          min={0}
          max={2}
          step={0.01}
          onValueChange={([v]) => setParams(p => ({...p, fieldStrength: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Drag: {params.drag.toFixed(3)}</p>
        <Slider 
          value={[params.drag]}
          min={0.01}
          max={1}
          step={0.001}
          onValueChange={([v]) => setParams(p => ({...p, drag: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Paddle Speed: {params.paddleSpeed.toFixed(1)}</p>
        <Slider 
          value={[params.paddleSpeed]}
          min={1}
          max={10}
          step={0.1}
          onValueChange={([v]) => setParams(p => ({...p, paddleSpeed: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Ball Velocity Influence Factor: {params.ballInfluence.toFixed(3)}</p>
        <Slider 
          value={[params.ballInfluence]}
          min={0.00001}
          max={0.1}
          step={0.001}
          onValueChange={([v]) => setParams(p => ({...p, ballInfluence: v}))}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Automatic Warmup reward LR: {params.warmupAutoReward.toFixed(5)}</p>
        <Slider 
          value={[params.warmupAutoReward]}
          min={0.00001}
          max={0.02}
          step={0.0001}
          onValueChange={([v]) => setParams(p => ({...p, warmupAutoReward: v}))}
        />
      </div>
      <div className="space-y-2">
          <p className="text-sm font-medium">Time Step (millis): {params.gameInterval}</p>
          <Slider 
            value={[params.gameInterval]}
            min={1}
            max={16}
            step={1}
            onValueChange={([v]) => setParams(p => ({...p, gameInterval: v}))}
          />
      </div>
    </div>
  );
};