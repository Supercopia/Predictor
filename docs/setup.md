# Setup Instructions

## Project Initialization

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Project Structure

```
predictor/
├── src/
│   ├── predictor_engine.js   # Core game state evaluator
│   └── actions_manager.js    # Action management system
├── data/
│   ├── actions.json         # Game action definitions
│   └── locations.json       # Valid game locations
├── schemas/
│   ├── actions.schema.json  # Action validation rules
│   └── config.schema.json   # Configuration validation
├── tests/
│   └── test_actions_manager.js  # Action system tests
├── docs/
│   ├── project_knowledge.md # Project overview and concepts
│   ├── code_progress.md     # Code change history
│   ├── progress.md          # General project log
│   ├── setup.md            # This file
│   ├── development_plan.md  # Implementation stages
│   ├── development_history.md # Historical context
│   └── context_guide.md     # Documentation guide
├── README.md                # Project readme
├── TODO.md                  # Pending tasks
└── package.json             # Project configuration
```

## Getting Started

Refer to `docs/context_guide.md` for a comprehensive guide on which documentation to read based on your task. This will help you quickly understand the project context and requirements.

## Development Workflow

1. All code changes require explicit "Yes, proceed" approval
2. Changes must be logged in appropriate changelog files
3. Follow the established logging format:
   - Author
   - Type
   - Timestamp
   - File affected
   - Testing details
   - Impact assessment
   - Tags
   - Rollback status

## Testing

The project uses Jest for automated testing:
```bash
npm test
```

Test files are located in the `tests/` directory. Each major component has its own test suite.

## Future Enhancements

1. UI Implementation
   - Scrollable timeline
   - Color-coded vitals
   - Inventory tooltips
2. Enhanced Inventory System
   - Match real game complexity
   - Additional item properties
3. Testing Suite
   - Automated test scenarios
   - Integration tests
