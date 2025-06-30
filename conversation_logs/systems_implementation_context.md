# Major Systems Implementation Context

## Implementation Overview

Three major game systems were implemented across multiple sessions, representing the core mechanics of the time-loop exploration game.

## Area Resources System

### Game Mechanic Concept
**Core Principle**: Location-based resources (air, water, food, power) that are consumed before personal vitals.

**Resource Consumption Priority**:
1. Area resources consumed first
2. Personal vitals consumed only after area resources depleted
3. Loop reset mechanics: everything resets except artifacts

### Implementation Approach
**User Requirement**: Explicit plan confirmation before implementation
**Development Strategy**: Modular system with clear separation of concerns

### Key Features Implemented
- **AreaResources Class**: Centralized resource management
- **Location-Based Storage**: Each location has independent resource pools
- **Generation System**: Rate-based replenishment (e.g., +0.2/s air generation in Talos)
- **Consumption Integration**: Predictor engine checks area resources before vitals
- **Loop Reset Logic**: Proper state management for time-loop mechanics

### Data Structure Changes
**Before**: `data/locations.json` as simple string array
```json
["Camp", "Talos", "Laurion", "Santorini"]
```

**After**: Object-based structure with resource data
```json
{
  "Talos": {
    "areaResources": {
      "air": {"initial": 50, "capacity": 50, "generation": 0.2}
    }
  }
}
```

### Location-Specific Resource Design
- **Talos**: 50 air capacity with +0.2/s generation (main safe zone)
- **Laurion**: 30 air, 25 power (no generation - resource limited)
- **Santorini**: Unlimited power generation (initial: -1 indicates unlimited)

## Events System

### Game Mechanic Concept
**Purpose**: Timer-based information tracking for time-loop game mechanics
**Function**: Events trigger at specific times and apply effects to game state

### Event Types Implemented
1. **startResourceDrain**: Begin consuming specific vitals
2. **stopAreaGeneration**: Stop area resource generation in specific locations

### Initial Event Data
- **"Hunger Starts"** at 60s: Begins food consumption (startResourceDrain effect)
- **"Carbon Filters Fail"** at 120s: Stops Talos air generation (stopAreaGeneration effect)

### Technical Implementation
- **Events Class**: Timer-based processing and effect application
- **Status Tracking**: Monitor which events are active
- **Integration**: Predictor engine processes events at each simulation step
- **Data Flow**: Event status included in timeline entries for frontend display

## Learning/Familiarity System

### Game Mechanic Concept
**Core Idea**: Actions become faster through repetition, representing character learning
**Progression**: Completion-based speed bonuses with different rates for different action types

### Learning Mechanics Implemented
**Speed Bonuses**:
- Fast learning actions: +0.1x speed per completion
- Slow learning actions: +0.01x speed per completion
- First completion bonus: Additional +0.2x for any action type

**Progression Curve**:
- Linear progression to 3x speed
- Diminishing returns beyond 3x
- Wait action bypasses learning system entirely

### Action Classification System
Enhanced `data/actions.json` with `learningType` field:
- **Fast Learning**: Travel actions, Cross Desert, Climb Mountain
- **Slow Learning**: Take Food Ration, Take Water Bottle
- **No Learning**: Wait (bypasses system)

### CSV Import Feature
**Purpose**: Allow import of learning data from external sources
**Implementation**: 
- File input interface in frontend
- CSV parser with validation against actions database
- Supports both completion count and time-based learning data
- Error handling for invalid CSV formats

### Speed Calculation Logic
```javascript
// Fast actions: base 1.0 + 0.1x per completion + 0.2x first time
// Slow actions: base 1.0 + 0.01x per completion + 0.2x first time
return 1.0 + learningRate + (isFirstCompletion ? 0.2 : 0);
```

## Integration Architecture

### Predictor Engine Integration
All three systems integrated into core simulation loop:
1. **Initialization**: Set up area resources, events, and learning state
2. **Action Processing**: Apply learning modifiers to action duration
3. **State Updates**: Process area resource consumption, event triggers, vital effects
4. **Timeline Data**: Include all system data in timeline entries

### Frontend Integration

#### Area Resources Display
- Added dedicated panel in right sidebar
- Real-time resource levels by location
- Generation rates display (+X.X/s format)
- Proper formatting for unlimited resources (∞/∞)

#### Learning System UI
- CSV import button and file input
- Learning data visualization in timeline
- Action duration modifications displayed

#### Events Display
- Event status tracking in timeline
- Visual indication of active events

### Server Configuration
Added explicit module serving routes:
- `/src/area_resources.js`
- `/src/events.js`
- `/src/familiarity.js`
- `/src/csv_parser.js`
- `/data/events.json`

## Implementation Challenges & Solutions

### Data Flow Issues (Fixed in 2025-06-26)
**Problem**: Area resources showing "No area resources available" after simulations
**Root Cause**: Simulation data not flowing properly from engine to frontend
**Solution**: Added missing data copying in simulationHistory

### Calculation Corrections (Fixed in 2025-06-26)
**Problem**: First completion bonus calculated incorrectly
**Understanding**: Should be normal rate + additional 0.2x, not just 0.1x universal
**Solution**: Updated calculation logic in familiarity system

### Capacity Integration (Fixed in 2025-06-26)
**Problem**: Vitals display showing "X/undefined" instead of capacity values
**Solution**: Preserved capacity fields when updating gameState after simulation

## User Interaction Patterns

### Implementation Process
- User requested explicit plan confirmation before each system
- Iterative feedback during development
- Comprehensive testing after implementation
- Clear confirmation when systems working: "Area resources confirmed working"

### Testing Approach
- Jest test suite verification (14/14 tests passing)
- Manual integration testing of all systems together
- Specific scenario testing for each system
- Cross-system interaction verification

## Current System Status

All three systems are fully functional and integrated:
- **Area Resources**: Location-based consumption working correctly
- **Events**: Timer-based triggers functioning properly
- **Learning/Familiarity**: Speed calculations and CSV import operational
- **Integration**: All systems work together without conflicts

## Future Considerations

### Expandability
- Systems designed for easy addition of new resource types
- Event system can handle new effect types
- Learning system supports new action classifications

### Configuration
- Centralized configuration approach for game constants
- JSON-based data structure for easy modification
- Schema validation for data integrity

### Performance
- Efficient processing for long simulations
- Minimal impact on timeline generation
- Scalable for additional game mechanics