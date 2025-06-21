# Context Guide for Predictor Project

This guide helps establish the necessary context for working on the Predictor project. When starting a new conversation, refer to this guide to understand which documents to read first.

## Essential Context (Always Read)

1. **Project Overview & Current State**
   - `docs/project_knowledge.md`: Core concepts, features, and architecture
   - `docs/progress.md`: Latest project status and recent changes

2. **Development Guidelines**
   - `docs/development_plan.md`: Current priorities and implementation stages
   - `TODO.md`: Pending tasks and future enhancements

## Task-Specific Context

### For Data File Changes
- `data/actions.json`: Game action definitions
- `data/locations.json`: Valid game locations
- `schemas/actions.schema.json`: Validation rules for actions
- `schemas/config.schema.json`: Validation rules for configuration

### For Schema Changes
- `schemas/actions.schema.json`: Action validation rules
- `schemas/config.schema.json`: Configuration validation rules
- `data/actions.json`: Current action definitions
- `data/locations.json`: Valid game locations

### For Action System Changes
- `src/actions_manager.js`: Action management implementation
- `test_actions_manager.js`: Action system tests
- `data/actions.json`: Current action definitions
- `data/locations.json`: Valid game locations

### For Game Engine Changes
- `src/predictor_engine.js`: Core game logic
- `tests/predictor_engine.test.js`: Engine test cases

### For Testing Infrastructure
- `tests/`: All test files
- `docs/code_progress.md`: Previous test implementations

### For Documentation Updates
- `docs/setup.md`: Project setup and structure
- `docs/development_history.md`: Historical context
- `README.md`: Public-facing documentation

### For Historical Context
- `docs/historical_context.md`: Project history and architectural decisions
- `docs/development_history.md`: Early development guidelines

### For Configuration Changes
- `package.json`: Project dependencies and scripts
- `schemas/config.schema.json`: Configuration validation
- `docs/setup.md`: Environment setup

### For Interface Development
- `docs/interface_specs.md`: Comprehensive interface specifications and design system
- `docs/progress.md`: Current frontend implementation status
- `docs/development_plan.md`: Interface development priorities
- `src/predictor_engine.js`: Core game logic for state management
- `data/actions.json`: Action definitions for the UI components
- `data/locations.json`: Location data for the interface

### For Technical Context
- `docs/technical_considerations.md`: Technical and procedural requirements
