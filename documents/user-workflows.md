# User Workflows

## User Types & Their Different Needs

### 1. Game Developer (You)

**Primary Use Case**: Balance testing and game design validation

**Workflow**:
1. Create an action sequence (loop) in the timeline interface
2. Run the same sequence multiple times while modifying game parameters
3. Compare results to see how parameter changes affect gameplay patterns
4. Save baseline graphs and compare them with current results during testing

**Parameter Modifications Include**:
- Action durations (how long actions take)
- Vital restoration amounts (how much resources restore)
- Any other game balance values

**Usage Patterns**:
- **Frequency**: Constantly modifies JSON files during active use
- **Focus**: Testing impact on both casual and optimal pathing (mostly casual)
- **Analysis**: Needs to compare baseline vs. current graphs for balance validation

**Future Workflow** (when complete):
1. Create action sequence in timeline
2. Use built-in UI editing controls to modify game parameters (no direct JSON editing)
3. See results/impact on the sequence through simulation
4. Save and compare graphs for analysis

### 2. Speedrunners (~10-20 users)

**Primary Use Case**: Route optimization for fast game completion

**Workflow**:
1. Create optimized action sequences (loops) using the timeline interface
2. Test and refine sequences to find fastest routes
3. Share successful configurations with other speedrunners

**Usage Patterns**:
- **Frequency**: Only modify JSON files when the game gets updated (every few months)  
- **Focus**: Creating optimized action sequences for speedrunning
- **Technical Comfort**: Probably comfortable editing JSON files, but don't need to
- **Sharing**: Copy/share JSON files with other speedrunners for configuration exchange

## Data Modification Patterns

### Development vs. Regular Use

**Development Modifications** (while building the app):
- **Purpose**: Adding missing information to JSON files
- **Type**: Data completeness and accuracy improvements
- **Frequency**: As needed during development

**Regular Use Modifications** (when using completed app):
- **Developer**: Constant parameter changes for balance testing
- **Speedrunners**: Occasional updates when game changes

### File Modification Requirements

**Timing Flexibility**: 
- Values can change during runtime or between sessions
- **Key Requirement**: No information is lost and users see correct information

**Data Persistence**:
- Changes must be reflected in the application immediately
- Users must see accurate, up-to-date information
- Implementation method (runtime vs. file-based) is flexible as long as user experience is correct

## Interaction with JSON Files

### Developer (You)
- **Current**: Would manually edit JSON files between testing runs
- **Future**: Will use built-in UI editing controls instead of direct file editing
- **Files Used**: All JSON files (constants, actions, events, locations)
- **Modification Frequency**: Very high during active balance testing

### Speedrunners
- **Current**: Could edit JSON files directly if needed
- **Primary Need**: Don't require direct JSON editing for their main use case
- **Files Used**: Primarily configuration files for sharing setups
- **Modification Frequency**: Low (only when game updates)

## Sharing and Distribution

**Method**: File-based sharing
- Users copy JSON files to share configurations
- No network-based sharing or central server
- Simple file exchange between community members

**Purpose**: 
- Speedrunners share optimal route configurations
- Developer might share test configurations
- Community collaboration through file exchange

## User Experience Requirements

### Both User Types Need:
- **Intuitive timeline interface** for creating action sequences
- **Clear simulation results** and feedback
- **Reliable data persistence** and loading
- **Easy configuration sharing** via file copying

### Developer-Specific Needs:
- **Parameter editing interface** (planned custom UI)
- **Graph generation and comparison** capabilities
- **Baseline saving and loading** functionality

### Speedrunner-Specific Needs:
- **Route optimization tools** and analysis
- **Easy sharing** of successful configurations
- **Reliable simulation** of optimized sequences

## Related Documentation

- See [Technical Requirements](technical-requirements.md) for how these workflows translate to technical specs
- See [Architecture Decisions](architecture-decisions.md) for why certain approaches were chosen to support these workflows