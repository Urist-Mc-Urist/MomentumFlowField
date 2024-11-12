# Overview

This project explores an alternative approach to AI behavior where:
- A point (called a "mote") moves through a 2D vector field
- The mote's position determines paddle movement
- The field gets shaped by successful trajectories
- Complex behavior patterns emerge naturally

The system learns to play Pong through direct experience, developing increasingly sophisticated movement patterns over time.

## Theory of Operation

The system operates on the principle that behavior can be modeled as movement through a continuous space where:
- Different regions correspond to different actions
- Momentum creates natural transitions
- Learning shapes the space itself
- Complex patterns emerge from simple dynamics

Rather than discrete decisions, behavior emerges from the natural flow of the system through its state space.

## Prerequisites

- [bun](https://bun.sh/)
- Node.js 14+ (for some development tools)

## #Installation

```bash
# Clone the repository
git clone https://github.com/Urist-Mc-Urist/MomentumFlowField.git
cd MomentumFlowField

# Install dependencies
bun install
```

## Running the Project

```bash
# Start the development server
bun run dev
```

Visit `http://localhost:5173` to view the simulator.

## Features

- Real-time visualization of the learning process
- Adjustable system parameters:
  - Learning rate
  - Path update decay
  - Noise level
  - Field strength
  - Drag coefficient
  - Ball velocity influence
  - Time step
  - Mirroring the input singal
- Visual representation of:
  - Current mote position
  - Vector field
  - Pong simulation


## Key Components

- **Vector Field**: Initialized with a slight circular tendency, creating a basic flow pattern. Each grid cell contains a direction vector that influences movement.

- **Movement System**: Updates position based on:
  ```javascript
  newVelocity = (currentVelocity + fieldForce + ballForce + noise) * drag
  newPosition = wrap(position + newVelocity)
  ```

- **Behavior Mapping**: Maps vertical position to paddle movement using a dead zone for stability:
  - Upper third → Upward movement
  - Middle third → Dead zone (no movement)
  - Lower third → Downward movement

- **Learning Process**: When rewards occur, updates vector field along recent trajectory:
  ```javascript
  reward_strength = learning_rate * decay_factor^(trajectory_length - i)
  field_vector += movement_direction * reward_strength
  ```

The system uses continuous wrapping for both position and field lookups, allowing smooth transitions across the entire state space.

### Learning Process

1. The mote moves through the vector field based on:
   - Current field vectors
   - Ball position/velocity influence
   - Natural momentum
   - Small random perturbations

2. When successful actions occur:
   - Recent trajectory is recorded
   - Vector field is updated along the path
   - More recent positions receive stronger updates
   - Field gradually develops optimal flow patterns

## System Parameters
### Learning Parameters
- Learning Rate:
    Controls how strongly successful trajectories reshape the vector field. Higher values mean faster adaptation but potentially less stable patterns.
- Path Update Decay:
    Determines how much recent actions are emphasized when reinforcing successful paths. Higher values create stronger immediate learning from recent success.
- Field Strength:
    How strongly the learned vector field influences movement. Balances between learned patterns and reactive behavior.
### Dynamic Parameterr
- Noise Level:    
    Random perturbations that prevent the system from getting stuck in local patterns and encourage exploration.
- Drag:
    Resistance to movement that prevents overshooting and creates more controlled transitions between states.
- Ball Velocity Influence:
    How strongly ball movement affects the system state. Higher values create more reactive behavior, while lower values rely more on learned patterns.
- Time Step:
    Simulation update interval. Smaller steps run the simulation faster.
### System States
- Warmup:
    Every step reinforces the current velocity by 1% of the learning rate and no penalites are applied. This helps the system create initial patterns
- Mirror Input
    Mirrors the x/y input signal from the ball. Interesting to see how different types of patterns emerge