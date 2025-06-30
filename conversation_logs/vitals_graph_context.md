# Vitals Graph Development Context

## Complete Development History

### Initial Implementation Challenges (2025-06-22)
The vitals graph started with significant technical challenges that required deep debugging:

1. **JavaScript Syntax Error**: Orphaned closing brace in HTML prevented page load
2. **Event Binding Issues**: Button clicks not triggering graph toggle function
3. **Data Structure Incompatibility**: Engine output format didn't match frontend expectations
4. **DOM Manipulation Problems**: Graph elements becoming detached from DOM tree
5. **CSS Positioning Conflicts**: Multiple positioning rules causing layout issues

**User Feedback Style**: User confirmed when issues were resolved: "Okay, it now appears"

### Complete Rework Decision (2025-06-22)
**Target Audience Shift**: From general users to game developers and expert speedrunners
**Scale Requirements**: 
- Vitals max ~15 (not 100 like most games)
- Decimal precision needed
- 30+ minute timeline analysis capability

**Implementation Philosophy**: Utility-focused visualization for pattern recognition, not just pretty charts

### Technical Architecture Evolution

#### Original Approach (Replaced)
- Horizontal lines with markers
- HTML/CSS based rendering
- Fixed scaling to 100
- Simple hover interactions

#### SVG-Based Replacement
- Connected line chart using SVG paths
- Mathematical accuracy to every second
- Dynamic scaling based on actual data
- Interactive tooltips with comprehensive state information

### Scaling System Development (2025-06-23)

#### Dynamic Maximum Scaling
**Problem**: Fixed maximum of 15 wasted space for lower vital values
**Solution**: Calculate maximum from actual simulation data
**Impact**: Better space utilization for varying vital ranges

#### Adaptive Time Intervals
**Problem**: Fixed 5-minute intervals inappropriate for all cycle lengths
**Solution**: Dynamic interval selection:
- ≤2 minutes: 30-second intervals
- ≤10 minutes: 1-minute intervals  
- ≤30 minutes: 5-minute intervals
- >30 minutes: 10-minute intervals

#### Configuration Architecture
Added `vitalsGraphConfig` object for centralized settings with no fallbacks during development to make issues visible.

### Capacity Integration Revolution (2025-06-24)

#### Game Mechanic Understanding
Critical insight: Vitals are capped at capacity limits. Items can't push vitals above capacity.

#### Chart Scaling Revolution
**Before**: `Math.max(...vitals)` - scaled to current vital values
**After**: `Math.max(...capacities)` - scaled to theoretical maximums
**Impact**: Charts now show the ceiling vitals can reach, enabling capacity-based planning

#### Starting Values Rationalization
Changed from unrealistic 100 to game-appropriate 10 for both vitals and capacities.

### Button State Synchronization Issue (2025-06-28)

#### Root Cause Discovery
**Problem**: Graph button state not updating when graph hidden by timeline re-rendering
**Investigation**: `renderTimeline()` uses `innerHTML = ''` destroying child elements
**Key Insight**: Vitals graph was child of timeline container, got destroyed and re-rendered with default hidden state

#### Structural Solution
**Approach**: Move graph from child to sibling element
**User's Choice**: Preferred structural fix over state patching
**Implementation**: HTML structure change + JavaScript cleanup

### Positioning Constraints (2025-06-28)

#### The Problem
After structural move, graph extended beyond timeline boundaries to screen edges.

#### CSS Solution Evolution
1. **Initial**: `left: 0; right: 0; width: 100%` (viewport-relative)
2. **Intermediate**: `left: 1rem; right: 1rem;` (still viewport-relative)  
3. **Final**: Added `position: relative` to timeline-container + graph margins (container-relative)

## User Interaction Patterns

### Problem Reporting Style
- Provides specific, reproducible scenarios
- Focuses on functional issues rather than cosmetic ones
- Tests thoroughly before reporting problems

### Solution Preferences
- Prefers root cause analysis over patches: "But do you know the cause, or are you just going to add a patch without knowing it?"
- Appreciates structural solutions over workarounds
- Values proper visual constraints and layout integrity

### Testing Approach
- Tests both functional behavior and visual appearance
- Provides clear confirmation when fixes work: "It works"
- Notices subtle issues like positioning and layout problems

## Technical Insights for Future Development

### DOM Manipulation Risks
Timeline re-rendering with `innerHTML = ''` destroys child elements. Consider this when placing UI components.

### SVG vs HTML/CSS for Data Visualization
SVG provides superior control for mathematical accuracy and interactive features.

### Positioning Context Matters
Absolutely positioned elements need proper positioning context (`position: relative` on containers).

### Configuration vs Hardcoding
Centralized configuration objects better than scattered hardcoded values, especially during development.

### Data Structure Evolution
Plan for data structure changes. Frontend should handle both nested and flat formats during transitions.

## Current State

The vitals graph is now a sophisticated, utility-focused visualization tool that:
- Scales properly to capacity limits
- Provides mathematical accuracy for expert analysis
- Adapts to various simulation lengths
- Offers interactive tooltips with comprehensive state information
- Maintains proper button state synchronization
- Stays within visual boundaries of its container

The system serves its target audience of game developers and expert speedrunners who need detailed, accurate analysis tools rather than simplified visualizations.