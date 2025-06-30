# CLAUDE.md - Terraformental Game Reference

This file provides guidance to Claude Code when working with the Terraformental game reference data for predictor development.

## Game Overview

**Game**: Terraformental  
**Version**: v0.4.0.23  
**Developer**: ShadyGames  
**Type**: Unity WebGL exploration game with time-loop mechanics  
**Engine**: Unity WebGL Player  

## Real Game Action Data Analysis

### Data Source
- **File**: `Actions_BaseTimes_v0.4.0.23.csv`
- **Actions Count**: 460 unique actions
- **Data Structure**: `identifier,name,baseTime`
- **Status**: Partial data (timing only, waiting for complete mechanics from game dev)

### Action Timing Scale
- **Range**: 1-1500 seconds (realistic game timing)
- **Short Actions**: 1-10 seconds (Take items, quick interactions)
- **Medium Actions**: 10-60 seconds (Exploration, simple tasks)
- **Long Actions**: 60-300 seconds (Complex operations, travel)
- **Very Long Actions**: 300-1500 seconds (Major travel, complex mining)

### Action Categories by Prefix

#### Story Progression
- **Meta**: Core game mechanics (Wait)
- **Intro**: Tutorial/opening sequence (37 actions)
- **Chapter1**: First major chapter (169 actions)
- **Chapter2**: Second major chapter (113 actions) 
- **Chapter3**: Third major chapter (67 actions)

#### Location-Specific Actions
- **Talos**: Starting facility actions (13 actions)
- **Laurion**: Secondary facility (11 actions)
- **Dam**: River crossing location (21 actions)
- **Santorini**: Major facility complex (15 actions)
- **Astrape**: Advanced facility (124 actions)
- **Road**: Inter-location travel (13 actions)
- **Tram**: Transportation system (4 actions)
- **Rover**: Vehicle-based actions (17 actions)
- **Vtol**: Aircraft operations (6 actions)
- **Generator**: Power system actions (2 actions)

### Key Locations Identified

#### Major Facilities
- **Talos**: Starting location, basic facilities
- **Laurion**: Secondary base with vehicle bay and charging
- **Astrape**: Largest facility with reactor, civilians, multiple sectors
- **Santorini**: Quarry compound with mining operations
- **Dam**: River crossing with supply crates

#### Contextual Locations
- **Rover**: Vehicle interior actions
- **Tram**: Transportation system connecting facilities
- **Vtol**: Aircraft for advanced exploration
- **Generator**: Mobile power systems

### Notable Action Patterns

#### Time Investment Examples
- **Quick Interactions**: "Take Protein Bar" (2s), "Open Door" (2-5s)
- **Moderate Tasks**: "Explore Facility" (45s), "Inspect Equipment" (30s)
- **Major Operations**: "Dig Fourth Layer" (270s), "Drive to Strabo" (1500s)
- **Complex Sequences**: Multi-step processes with realistic timing

#### Progression Structure
1. **Intro Sequence**: Tutorial actions, facility awakening
2. **Chapter 1**: Exploration expansion, rover operations
3. **Chapter 2**: Advanced facilities, mining operations
4. **Chapter 3**: End-game content, aircraft operations

## Predictor Integration Notes

### Current Predictor Capabilities
- ✅ Action timing: Already supports any second-based duration
- ✅ Action lookup: Uses flexible action name mapping
- ✅ Location system: Supports arbitrary location names
- ✅ Capacity system: Implemented and ready for real vital mechanics
- ✅ Chart scaling: Handles long simulations (30+ minutes)

### Future Integration Requirements
When complete action data arrives from game dev:

1. **Replace actions.json**: Convert real game data to predictor format
2. **Update locations.json**: Add real game locations
3. **Validate mechanics**: Ensure consumption rates, inventory effects match game
4. **Test scaling**: Verify capacity system works with real vital ranges

### Missing Data (Pending from Game Dev)
- Vital consumption rates per action
- Inventory effects (items gained/consumed)
- Location requirements and movement
- Capacity modifications
- Extra consumption rates for demanding actions

### Predictor Compatibility
The current predictor architecture is already designed to handle:
- Real action names and identifiers
- Realistic timing (1-1500 seconds)
- Complex location systems
- Variable consumption rates
- Capacity-based vital systems

## Development Priorities

### Immediate (Ready Now)
- ✅ Capacity system testing with current data
- ✅ Chart visualization for long simulations
- ✅ Documentation of real game structure

### Future (When Complete Data Arrives)
- 🔄 Real action data integration
- 🔄 Location system updates
- 🔄 Validation against actual game mechanics
- 🔄 Performance testing with 460+ actions

## Technical Notes

### Action Identifier Format
- Dot notation: `Category.ActionName` (e.g., `Intro.OpenPod`, `Astrape.TouchArtifact`)
- Hierarchical structure: Facility → Chapter → Specific Action
- Consistent naming convention across game progression

### Timing Accuracy
- All times in seconds (not milliseconds)
- Realistic scale matching actual gameplay duration
- No artificial speed-up for testing (authentic game pacing)

### Chart Visualization Implications
- 30+ minute simulations now realistic with real action timing
- Zoom functionality becomes essential for detailed analysis
- Tooltip information critical for long timeline navigation

## Reference for Future Development

This analysis provides the foundation for integrating real Terraformental game mechanics into the predictor. The current predictor architecture is already compatible with the real game's action structure and timing requirements.

When complete mechanics data becomes available, integration should be straightforward due to the flexible design of the predictor engine.