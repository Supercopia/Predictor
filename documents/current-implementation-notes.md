# Current Implementation Notes

## Current Architecture Overview

### Express.js Server Setup

**Technology Stack**:
- **Backend**: Express.js server (`server.js`)
- **Frontend**: Vanilla JavaScript with HTML/CSS
- **Data**: JSON files served via HTTP endpoints
- **Port**: Runs on localhost:3000
- **Startup**: `npm start` or `npm run dev` (with nodemon)

**Server Structure**:
- **Static serving**: `express.static` for public directory
- **Explicit routes**: Individual routes for JavaScript modules
- **JSON endpoints**: Routes for serving data files
- **Fallback handling**: Catch-all route for SPA navigation (recently removed)

### Current File Structure

```
/
├── server.js                 # Express server
├── package.json             # Node.js dependencies
├── public/                  # Static web assets
│   ├── index.html          # Main HTML page
│   ├── css/                # Stylesheets
│   └── js/                 # Frontend JavaScript
├── src/                    # Backend/shared JavaScript modules
│   ├── predictor_engine.js # Core simulation logic
│   ├── actions.js          # Action definitions loader
│   ├── constants.js        # Constants loader
│   ├── events.js           # Events system
│   ├── familiarity.js      # Learning system
│   ├── area_resources.js   # Resource management
│   ├── csv_parser.js       # CSV parsing utilities
│   ├── actions_manager.js  # Runtime action management
│   └── loader.js           # Environment compatibility layer (recent)
└── data/                   # JSON configuration files
    ├── constants.json      # Game balance parameters
    ├── actions.json        # Available actions
    ├── events.json         # Game events
    └── locations.json      # Game locations
```

## Known Issues and Problems

### Primary Issue: JSON Loading Failures

**Current Problem**: Browser receives HTML instead of JSON when requesting data files
**Root Cause**: Missing server routes for JSON files that the frontend tries to load
**Error Messages**: 
- `Failed to load /data/constants.json: 404 Not Found`
- `SyntaxError: Unexpected token '<'` (HTML being parsed as JSON)

**Files Affected**:
- `/data/constants.json` - Missing route
- `/data/events.json` - Missing route  
- Other JSON files may have similar issues

### Secondary Issues

**Dual Environment Compatibility**:
- Created `loader.js` to handle browser vs. Node.js differences
- Uses `fetch()` for browser, `require()` for Node.js
- Added complexity that may not be needed in desktop app

**Routing Architecture**:
- Mix of explicit routes and static file serving
- Inconsistent patterns for different file types
- Removed catch-all route for better error visibility

## Code Migration Considerations

### Code to Preserve

**Core Game Logic** (high value, should migrate):
- `predictor_engine.js` - Core simulation engine with vitals, resources, timing
- `familiarity.js` - Learning/speed multiplier system
- `area_resources.js` - Location-based resource generation
- `events.js` - Game events system (class-based with state management)

**Frontend Interface** (valuable, needs adaptation):
- Timeline drag-and-drop interface (existing in `public/js/`)
- Three-panel layout (actions list, timeline, results)
- Simulation visualization and feedback

**Data Structures** (essential):
- JSON schemas and data organization
- Action definitions and game balance parameters
- Location definitions and event configurations

### Code to Modify/Replace

**Server Infrastructure** (needs replacement):
- `server.js` - Express server logic (replace with desktop app framework)
- HTTP routing and static file serving (replace with file system access)
- Package.json dependencies for server (update for desktop app)

**Environment Compatibility** (needs simplification):
- `loader.js` - Current dual-environment approach may be unnecessary
- Browser/Node.js compatibility layers (desktop app has unified environment)

**Data Loading** (needs redesign):
- HTTP requests for JSON data (replace with direct file system access)
- Server-side JSON serving (replace with client-side file operations)

### Code to Discard

**Temporary Solutions**:
- Explicit server routes for individual files
- HTTP-based data loading mechanisms
- Express.js middleware and configuration

**Development Infrastructure**:
- Current package.json server dependencies
- Development server startup scripts
- Server-specific error handling

## Development Workflow During Migration

### Current Development Process

**Startup**: `npm run dev` (nodemon for auto-reload)
**Testing**: Browser at localhost:3000
**File Changes**: Server auto-restarts, browser refresh needed
**Debugging**: Browser dev tools + server console logs

### Migration Considerations

**Preserve Functionality**: Keep current features working during transition
**Data Compatibility**: Maintain existing JSON file formats
**UI Consistency**: Preserve current interface design and behavior
**Testing Strategy**: Ensure simulation accuracy is maintained

## Current State Assessment

### What Works
- **Core simulation logic**: Predictor engine functions correctly
- **Frontend interface**: Timeline and UI components work
- **Data structure**: JSON files contain proper game data
- **Development workflow**: Can iterate on game logic and interface

### What's Broken
- **Data loading**: JSON files not properly served to browser
- **Architecture mismatch**: Server approach doesn't match target requirements
- **Distribution**: Current approach requires Node.js for users

### Development Priority
**Immediate**: No need to fix current issues since migration is planned
**Focus**: Plan and execute migration to desktop app architecture
**Principle**: Avoid temporary fixes that will be discarded

## Migration Path Forward

### High-Level Migration Steps
1. **Choose desktop framework**: Electron, Tauri, or alternative
2. **Migrate frontend**: Adapt existing HTML/CSS/JS to desktop framework
3. **Replace data loading**: Convert HTTP requests to file system access
4. **Package application**: Create standalone executable
5. **Test and validate**: Ensure feature parity with current implementation

### Data Migration Strategy
- **Keep JSON files**: Maintain current data structure and files
- **Direct file access**: Replace HTTP requests with file system operations
- **Preserve compatibility**: Ensure existing configurations still work

## Related Documentation

- See [Architecture Decisions](architecture-decisions.md) for why migration was chosen over fixes
- See [Technical Requirements](technical-requirements.md) for target desktop app specifications
- See [User Workflows](user-workflows.md) for functionality that must be preserved