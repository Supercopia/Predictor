# Context Problems for Future Claude Sessions

## Overview

This document outlines the specific context gathering challenges that future Claude sessions will face when working on the Predictor project, even with the comprehensive conversation logs system in place.

## Core Context Gathering Difficulties

### 1. File Discovery Challenges
*Which files to read for specific tasks*

**Problem**: The codebase contains many files, and future Claude won't immediately know which are most relevant for specific tasks.

**Specific Issues**:
- **Scale Problem**: Project has numerous files across `src/`, `public/js/`, `public/css/`, `data/`, `schemas/`, `tests/` directories
- **Task-File Mapping**: A request like "fix the timeline display" could involve `app.js`, `styles.css`, `index.html`, or `predictor_engine.js`
- **System Boundaries**: Understanding which files belong to which system (vitals graph, area resources, events, learning) without reading multiple files

**Mitigation Strategy**: Use conversation logs' topic-specific files (e.g., `vitals_graph_context.md`) to understand which files are involved in specific systems.

### 2. Code Location Mapping
*Understanding scattered implementation across files*

**Problem**: Key functionality is distributed across multiple files with complex interdependencies.

**Specific Issues**:
- **Implementation Scattered**: Core logic spans:
  - `src/predictor_engine.js` - simulation engine
  - `public/js/app.js` - UI logic and data visualization
  - `src/actions_manager.js` - action management
  - Various data files in `data/` directory
- **Function Dependencies**: Understanding how `renderTimeline()` interacts with vitals graph, capacity system, area resources
- **Change Impact Analysis**: Modifying one system may affect others (e.g., capacity changes affect both engine and UI)

**Current State Example**: 
- Vitals graph button state issue required understanding both `renderTimeline()` in `app.js` and HTML structure in `index.html`
- Solution involved moving graph element location, updating CSS positioning, and removing JavaScript DOM manipulation code

### 3. State Understanding Gaps
*Verifying current state matches documented state*

**Problem**: Future Claude needs to verify that current codebase state matches documented state.

**Specific Issues**:
- **Current vs. Documented**: Conversation logs document what was implemented, but code may have been modified since
- **Implementation Verification**: Future Claude must verify that documented features actually work as described
- **Uncommitted Changes**: Git status shows multiple modified files:
  ```
  M .claude/settings.local.json
  M data/actions.json
  M docs/code_progress.md
  M docs/progress.md
  M public/css/styles.css
  M public/index.html
  M public/js/app.js
  D public/src/predictor_engine.js
  M server.js
  M src/predictor_engine.js
  ?? Input/
  ?? public/src/predictor_engine.js.old
  ?? reference_game/
  ?? src/csv_parser.js
  ?? src/familiarity.js
  ```
- **System Integration Status**: All systems (vitals, capacity, area resources, events, learning) documented as working, but future Claude should verify
- **Test Coverage**: Jest tests show 14/14 passing, but future Claude needs to understand what's tested vs. what requires manual verification
- **Assumption Risk**: Future Claude might assume documented state is current state without verification, leading to incorrect solutions

### 4. Token Budget Constraints
*Efficiently reading context without consuming too much*

**Problem**: Reading comprehensive context consumes significant tokens before starting actual work.

**Specific Issues**:
- **Context Size**: Full conversation logs span multiple files with detailed technical information
- **Efficiency Trade-offs**: Future Claude must balance thorough understanding vs. quick task completion
- **Selective Reading Strategy**: Need to strategically choose which context files to read based on task type
- **Progressive Context Loading**: May need to read basic context first, then dive deeper as needed

**Recommended Approach**:
1. **Start with README.md**: Understand overall project structure and recent changes
2. **Read relevant topic context**: Choose `vitals_graph_context.md`, `systems_implementation_context.md`, or `ui_development_context.md` based on task
3. **Check current state**: Read relevant source files to verify current implementation
4. **Deep dive as needed**: Read session-specific logs only if encountering unexpected issues

## Successful Context Gathering Strategy

### For Different Task Types

**UI/Visual Issues**:
1. Read `ui_development_context.md` first
2. Check `public/js/app.js`, `public/css/styles.css`, `public/index.html`
3. Reference vitals graph context if graph-related

**System/Logic Issues**:
1. Read `systems_implementation_context.md` first
2. Check `src/predictor_engine.js` and relevant system files
3. Reference session logs for specific implementation details

**Bug Reports**:
1. Read `README.md` for recent changes
2. Check git status for uncommitted changes
3. Read relevant context files based on reported issue area

### Context Validation Checklist

Before starting work, future Claude should verify:
- [ ] Current git status matches expectations
- [ ] Jest tests still pass (`npm test`)
- [ ] Server starts without errors (`npm start`)
- [ ] UI loads and basic functionality works
- [ ] Specific system mentioned in task is functional

## Key Project Insights for Quick Orientation

### Architecture Overview
- **Three-panel UI**: Actions list (left), timeline (center), game state (right)
- **Core Engine**: `src/predictor_engine.js` handles all simulation logic
- **Systems**: Capacity, area resources, events, learning/familiarity all integrated
- **Data-Driven**: JSON files in `data/` directory with schema validation

### User Preferences (from conversation logs)
- Prefers root cause analysis over patches
- Values structural solutions over workarounds
- Expects explicit approval for medium/large changes
- Appreciates technical explanations of approaches
- Tests thoroughly and provides clear feedback

### Development Workflow
- Ask "Should I proceed?" for non-trivial changes
- Document all changes in progress files
- Run tests after changes
- Update conversation logs for significant work

## Emergency Context Recovery

If future Claude encounters unexpected issues or inconsistencies:

1. **Check Recent Session Logs**: Look at `session_2025-06-28.md` (most recent) for latest changes
2. **Verify System Status**: Run full test suite and manual functionality checks
3. **Compare Git State**: Current changes vs. documented changes
4. **Read Deep Context**: Dive into specific system context files for detailed implementation history

This approach should help future Claude sessions efficiently gather the right context while avoiding common pitfalls in understanding the project state.