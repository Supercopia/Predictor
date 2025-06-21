# Technical Considerations

This document outlines important technical and procedural requirements that must be followed when working on the Predictor project.

## Change Management

### Approval Process
1. All code changes require explicit "Yes, proceed" approval
2. Changes must be logged in:
   - `docs/progress.md` for high-level changes
   - `docs/code_progress.md` for technical details

### Validation Steps
1. Check file structure in `docs/progress.md`
2. Verify against current priorities in `docs/development_plan.md`
3. Review relevant task-specific documentation
4. Consult `TODO.md` for related pending tasks

## Runtime System

### Action Management
- The action system supports runtime modifications
- Actions can be added, modified, or removed during execution
- All changes must be validated against:
  1. Action schema (schemas/actions.schema.json)
  2. Location list (data/locations.json)
- Use ActionsManager for all action modifications

### State Management
- Game state is evaluated continuously
- Vitals deplete at -0.1/s base rate
- Auto-consumption triggers when vitals drop below 0
- Location requirements are enforced at runtime

## Testing Requirements

### New Features
- All new features must have corresponding tests
- Tests should cover:
  - Happy path
  - Edge cases
  - Error conditions
  - Integration points

### Testing Framework
- Jest is the standard testing framework
- Run tests with `npm test`
- Tests must be in the `tests/` directory
- Follow existing test patterns

### UI Components
- Manual testing required for UI features
- Document test scenarios
- Include user interaction flows
- Test responsive behavior

## Documentation Standards

### File Synchronization
- All documentation files must be kept in sync
- Update all affected docs when making changes
- Cross-reference between related docs

### File Structure
- Update file tree in `docs/setup.md` when adding files
- Maintain proper directory organization
- Document new file purposes

### Change Logging
- All changes require entries in:
  1. `docs/progress.md` for high-level changes
  2. `docs/code_progress.md` for technical details
- Follow established metadata format:
  - Author
  - Type
  - Timestamp
  - Files affected
  - Testing details
  - Impact
  - Tags
  - Rollback status

## Schema Validation

### JSON Schemas
- All data files must have corresponding schemas
- Validate against schemas before saving
- Update schemas when data structure changes

### Location Validation
- All locations must be in locations.json
- Validate both target and requirement locations
- Support multiple valid locations per action

## Performance Considerations

### State Calculation
- Optimize loops for large action sequences
- Cache frequently accessed data
- Monitor memory usage with large datasets

### Validation
- Perform validation at appropriate times
- Cache validation results when possible
- Use efficient data structures for lookups
