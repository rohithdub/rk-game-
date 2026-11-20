# RK WORLD

A standalone 3D browser game created by **Rohith Kumar**, built upon the 3D interactive driving foundation of **Bruno Simon's Folio 2025**.

---

## Overview

**RK WORLD** transforms the acclaimed 3D driving experience into a standalone game. Explore an expansive interactive world with realistic vehicle physics, dynamic weather, day-night cycles, hidden challenges, racing circuits, and environmental interactions.

### Key Features
- **Interactive 3D Driving Mechanics**: Realistic vehicle physics simulation using Rapier 3D with acceleration, drifting, reversing, boosting, jumping, and suspension hydraulics.
- **Dynamic Environment**: Real-time day/night cycles, seasonal transitions, dynamic weather (rain, snow, lightning, wind), and atmospheric effects.
- **Circuit Racing**: Timed race track with checkpoints, lap timer, and local & online leaderboards.
- **Interactive Zones & Secrets**: Bowling alley, domino/brick destruction, explosive crates, bonfire reset, chaos altar, portals, and hidden easter eggs.
- **Achievement System**: Over 35 unique achievements tracking exploration, driving stunts, and discoveries.
- **Multi-Device Support**: Optimized for Keyboard + Mouse, Touch screen devices (smartphones and tablets), and Gamepads (Xbox & PlayStation controllers).
- **Next-Gen Rendering**: Dual WebGL and WebGPU rendering pipeline using Three.js and Three Shading Language (TSL).

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- Modern desktop browser (Chrome, Edge, Firefox, or Safari with WebGL 2.0 / WebGPU support)

### Installation

```bash
# Install dependencies
npm install --force

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The game will launch directly in your default browser at `http://localhost:1234` or the port displayed in your terminal.

---

## Controls

### Keyboard & Mouse
| Input | Action |
| --- | --- |
| **WASD** / **Arrow Keys** | Steer, accelerate, reverse |
| **Left Shift** | Turbo Boost |
| **Left Ctrl** / **B** | Brake |
| **Space** | Jump |
| **Enter** | Interact with world points |
| **M** | Toggle Map |
| **L** | Mute / Unmute Audio |
| **R** | Respawn at nearest checkpoint |
| **H** | Honk Horn |
| **Number Keys / Numpad** | Hydraulic suspension lifts |
| **Left Click + Drag** | Rotate camera |
| **Mouse Wheel** | Zoom camera |

### Gamepad
| Button (Xbox / PS) | Action |
| --- | --- |
| **LT / L2** | Accelerate |
| **RT / R2** | Reverse |
| **Left Stick** | Steering |
| **Right Stick** | Camera control |
| **B / Circle** | Boost |
| **X / Square** | Brake |
| **Y / Triangle** | Jump |
| **A / Cross** | Interact / Exit |
| **LB / RB (L1 / R1)** | Hydraulics |
| **Select / Share** | Reset world |
| **Start / Options** | Pause / Menu |

---

## Project Architecture

- **`sources/Game/`**: Core game engine architecture.
  - `Game.js`: Central game coordinator singleton.
  - `Physics/`: Rapier 3D physics engine and vehicle dynamics (`PhysicsVehicle.js`).
  - `World/`: Environment objects, terrain, flora, weather, and interactive areas (`Areas/`).
  - `Inputs/`: Unified input router supporting Keyboard, Mouse, Touch, and Gamepads.
  - `Cycles/`: Day/night and seasonal progression systems.
  - `Rendering.js`: WebGPU/WebGL postprocessing and rendering pipeline.
  - `Audio.js`: 3D spatial audio management with Howler.js.
  - `Achievements.js`: Game progression and unlockable skin rewards.
- **`sources/style/`**: Stylus styles for HUD, menus, interactive dialogs, and loaders.
- **`static/`**: 3D models (GLTF/GLB), KTX compressed textures, audio files, and UI assets.

---

## Credits & Licensing

- **Creator & Personalization**: Rohith Kumar
- **Original Foundation**: [Folio 2025](https://github.com/brunosimon/folio-2025) by Bruno Simon, licensed under the [MIT License](LICENSE.md).
- **Soundtrack**: Composed by Kounine ([CC0 License](https://creativecommons.org/publicdomain/zero/1.0/)).
- **Full Details**: Please see [CREDITS.md](CREDITS.md) for full licensing and attribution information.
