# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Predictor is a simulation and analysis tool for a text-based exploration game with time-loop mechanics. It helps optimize gameplay by simulating action sequences, tracking vital resources (air, water, food), inventory management, and location-based movement.

## Development Commands

### Running the Application
```bash
npm start          # Runs the Express server on port 3000
npm run dev        # Runs server with nodemon for auto-reload
```

### Testing
```bash
npm test           # Run Jest test suite
npm run test:watch # Run Jest in watch mode
npm run test:coverage # Run tests with coverage report
```

Test files are located in `tests/` directory and follow the pattern `*.test.js`.

## Architecture Overview

### Core Components

1. **Game Engine** (`src/predictor_engine.js`): Core simulation logic that evaluates actions and tracks game state
   - Vitals management (air, water, food with -0.1/s base depletion)
   - Auto-consumption triggers when vitals < 0
   - Location-based action validation

2. **Actions System** (`src/actions.js`, `src/actions_manager.js`): 
   - JSON-based action definitions in `data/actions.json`
   - Runtime modification support via ActionsManager
   - Schema validation via `schemas/actions.schema.json`

3. **Web Interface** (`public/`):
   - Three-panel layout: Actions List, Timeline (drag-drop), Simulation Results
   - Vanilla JavaScript (no framework)
   - Real-time simulation feedback

4. **Server** (`server.js`): Express.js with CORS enabled

### Data Architecture

All game data stored as JSON with schema validation:
- `data/actions.json` - Action definitions
- `data/locations.json` - Location definitions
- `schemas/` - JSON schema definitions for validation

## Development Workflow

### Change Management Process
1. **All code changes require explicit approval** - Ask "Should I proceed?" before implementing
2. **Document changes** in:
   - `docs/progress.md` for high-level changes
   - `docs/code_progress.md` for technical details with metadata

### Change Classifications
- **Small**: Direct implementation (< 50 lines)
- **Medium**: Brief plan → approval → implement
- **Large**: Detailed plan → approval → implement

### Code Standards
- File size limit: 200-300 lines
- Modular structure with single responsibility per file
- All new features require tests
- Prefer editing existing files over creating new ones

## Testing Guidelines

- Test files go in `tests/` directory
- Cover: happy path, edge cases, error conditions, integration points
- Follow existing test patterns in the codebase
- Manual testing required for UI features

## Key Technical Considerations

1. **Performance**: Optimize for large action sequences, cache frequently accessed data
2. **Validation**: All data must pass schema validation before saving
3. **Location System**: Actions validate against both target and requirement locations
4. **State Management**: Continuous evaluation with real-time vitals tracking

## Project Priorities (Current)

1. **High Priority**: Testing infrastructure, data management
2. **Medium Priority**: Core enhancements, frontend development, documentation
3. **Low Priority**: UI polish, performance optimization

## Important Files

- `src/predictor_engine.js` - Core game simulation logic
- `src/actions_manager.js` - Runtime action management
- `public/js/app.js` - Main frontend application
- `schemas/*.schema.json` - Data validation schemas
- `docs/development_plan.md` - Detailed development roadmap
- `TODO.md` - Current task list and priorities