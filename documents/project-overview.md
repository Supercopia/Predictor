# Project Overview

## What is Predictor?

Predictor is a simulation and analysis tool for a text-based exploration game with time-loop mechanics. It helps users optimize gameplay by simulating action sequences, tracking vital resources (air, water, food), inventory management, and location-based movement.

## Primary Purpose

**Core Function**: Simulate "what-if" scenarios for game strategies without requiring actual gameplay repetition.

The application allows users to:
- Create and test action sequences (called "loops" in the game) using a drag-and-drop timeline interface
- Simulate gameplay mechanics including vitals depletion, resource consumption, and location movement
- Analyze results through simulation feedback and graphs
- Optimize routes and strategies for different purposes

## Target Users

### 1. Game Developer (Primary User: You)
**Goal**: Test how balance changes affect player behavior
**Usage**: Run action sequences while modifying game parameters to see impact on both casual and optimal pathing
**Focus**: Balance testing and game design validation

### 2. Speedrunners (~10-20 total users)
**Goal**: Create optimized action sequences for fast game completion
**Usage**: Design and test optimal routes through the game
**Focus**: Route optimization and speedrun strategy development

**Note**: The application does NOT help normal/casual players - only speedrunners benefit as end users.

## Project Scale & Context

- **Small fan project** for an indie game
- **Total user base**: Maximum 10-20 people
- **Community**: Intimate fan community focused on optimization
- **Distribution**: Users share configurations by copying/sharing JSON files

## Development Status

- **Current State**: In active development
- **Production Use**: Will not be used until completely finished
- **Demo Timeline**: Demo planned soon to showcase progress (not for actual use)
- **Development Philosophy**: Avoid temporary implementations that need to be undone later

## Key Project Characteristics

- **Local Application**: No remote servers or cloud infrastructure
- **File-Based Sharing**: Users share configurations by copying JSON files
- **Windows Primary**: Must work on Windows, other platforms are bonus
- **Double-Click Executable**: Target is packaged desktop app with external JSON files
- **Small Scale**: Solutions should match the intimate scale (avoid over-engineering)

## Related Documentation

- See [User Workflows](user-workflows.md) for detailed usage patterns
- See [Technical Requirements](technical-requirements.md) for architecture specifications
- See [Architecture Decisions](architecture-decisions.md) for technology choices