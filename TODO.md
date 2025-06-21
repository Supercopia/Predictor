# TODO List

## Stage 1: Testing & Data Foundation
- [x] Testing Setup
  - [x] Install and configure Jest
  - [x] Set up test runner
  - [ ] Prepare CI integration configs
- [x] Core Test Implementation
  - [x] Action evaluation tests
  - [x] Vital system tests
  - [x] Inventory management tests
  - [x] Location validation tests
- [ ] Performance Testing
  - [ ] Large sequence tests
  - [ ] Memory usage tests
  - [ ] State calculation tests
- [ ] Scenario Testing
  - [ ] Create test scenarios
  - [ ] Implement gameplay loop tests
  - [ ] Edge case tests
- [x] Data Structure
  - [x] Define JSON schemas
    - [x] Actions schema
    - [x] Config schema
    - [x] Save state schema
  - [x] Create validation rules
  - [x] Design migration strategy
- [ ] Schema Implementation
  - [ ] Install ajv validator
  - [ ] Add schema validation tests
  - [ ] Convert actions.js to JSON
  - [ ] Create default config.json

## Stage 2: Core Enhancements
- [ ] JSON Storage System
  - [ ] Create data/ directory
  - [ ] Implement actions.json
  - [ ] Set up config.json
  - [ ] Create saves/ directory
  - [ ] Add version tracking
- [ ] Validation Implementation
  - [ ] Input validators
  - [ ] State validators
  - [ ] Format verifiers
- [ ] Save State System
  - [ ] Save/load functions
  - [ ] State versioning
  - [ ] Migration tools

## Stage 3: UI Development
- [ ] Basic Structure
  - [ ] HTML layout
  - [ ] CSS styling
  - [ ] JavaScript setup
- [ ] State Management
  - [ ] State update system
  - [ ] UI sync handlers
  - [ ] Event system
- [ ] Visualizations
  - [ ] Vital graphs
  - [ ] Path visualizer
  - [ ] Resource charts
- [ ] Interactive Features
  - [ ] Timeline controls
  - [ ] Inventory interface
  - [ ] Location navigation

## Stage 4: Documentation & Polish
- [ ] Code Cleanup
  - [ ] Remove debug logging from actions_manager.js
  - [ ] Implement proper logging system
- [ ] Technical Docs
  - [ ] API documentation
  - [ ] Schema documentation
  - [ ] Test coverage reports
- [ ] User Docs
  - [ ] Usage guide
  - [ ] Tutorials
  - [ ] Setup instructions
- [ ] Development Docs
  - [ ] Component docs
  - [ ] Contribution guide
  - [ ] Testing guide

## Bugs & Issues
*(None reported yet)*

## Ideas for Future Enhancement
- Add support for custom vital types
- Implement action chaining/combos
- Add visualization for optimal paths
- Create scenario editor
- Add save state import/export
- Implement undo/redo system
