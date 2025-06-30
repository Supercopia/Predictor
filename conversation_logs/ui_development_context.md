# UI Development Context

## User Experience Philosophy

### Target Audience Evolution
**Initial**: General game players
**Current**: Game developers and expert speedrunners who need detailed analysis tools

### Design Principles Established
- **Utility over aesthetics**: Functionality-focused interface design
- **Information density**: Show comprehensive state information
- **Mathematical accuracy**: Precise data representation over simplified visualizations
- **Expert-friendly**: Assume users want detailed control and information

## Major UI Development Phases

## Phase 1: Timeline Interface Foundation (2025-06-21)

### Core Timeline Features
**Multiplier Control System**:
- Step controls (increase/decrease buttons) in timeline footer
- Multiplier input field for batch action count modifications
- Global step size control for consistent count adjustments
- Per-action controls (increase/decrease/remove) on timeline items

**Enhanced Timeline Items**:
- Count display showing "Action x3" format
- Disabled action states with strikethrough text and reduced opacity
- Flex layout restructure for better visual organization
- Location requirement indicators vs destination displays

### Visual Improvements
**Layout Enhancements**:
- Restructured timeline items with action-content and action-controls sections
- Enhanced action content layout with proper spacing
- Improved drag-drop visual feedback and interaction
- Better visual hierarchy and information organization

### Custom Scrollbar Implementation
**Features**:
- Always-visible vertical scrollbar for timeline container
- Webkit scrollbar theming matching project colors (gold/purple)
- Enhanced scrolling behavior and visual consistency
- Proper container sizing for scroll functionality

## Phase 2: Vitals Graph Interface (2025-06-22 to 2025-06-24)

### Initial Graph Implementation
**Technical Challenges**:
- JavaScript syntax errors preventing page load
- Button event binding issues
- Data structure compatibility problems
- DOM manipulation causing element detachment
- CSS positioning conflicts

**User Feedback Pattern**: Direct problem reporting with specific reproduction steps

### Complete Graph Rework
**SVG-Based Visualization**:
- Replaced HTML/CSS approach with SVG for mathematical accuracy
- Connected line chart implementation using SVG paths
- Interactive tooltip system with mousemove tracking
- Grid system with dynamic labels based on timeline duration

**Scaling System**:
- Dynamic maximum scaling based on actual data
- Adaptive time intervals (30s/1m/5m/10m) based on cycle length
- Configurable Y-axis grid through centralized config object
- Capacity-based scaling for proper ceiling visualization

### Graph Configuration Architecture
**Development Philosophy**: No fallbacks during development to make issues visible
**Configuration Object**: Centralized `vitalsGraphConfig` for all settings
**Future-Ready**: Structure supports different chart types (connected vs step)

## Phase 3: Systems Integration UI (2025-06-25)

### Area Resources Panel
**Right Sidebar Addition**:
- Dedicated area-resources-display section
- Current resource levels by location with proper formatting
- Generation rates display where applicable (+X.X/s format)
- Proper formatting for unlimited resources (∞/∞)
- CSS styling for consistent layout with existing panels

### Learning System Interface
**CSV Import Functionality**:
- "Import Learning CSV" button in timeline controls
- Hidden file input for CSV selection
- Automatic parsing and state initialization
- Error handling for invalid CSV data
- User feedback for import success/failure

### Enhanced Timeline Display
**Learning Integration**:
- Action duration modifications displayed in timeline
- Learning data visualization
- Speed multiplier information
- First completion bonus indication

## Phase 4: Button State & Positioning (2025-06-28)

### Button State Synchronization
**Problem Context**: Graph button state not updating when graph hidden by timeline re-rendering
**User Preference**: Root cause analysis over patches
**Solution Approach**: Structural fix moving graph outside timeline container

### Positioning Constraints
**Problem**: Graph extending beyond timeline boundaries
**Solution Evolution**:
1. Initial viewport-relative positioning
2. Margin-based constraints (still viewport-relative)
3. Final container-relative positioning with proper context

## User Interaction Patterns Observed

### Problem Reporting Style
- Provides specific, reproducible scenarios
- Tests functionality thoroughly before reporting issues
- Focuses on functional problems rather than cosmetic preferences
- Clear confirmation when fixes work: "It works"

### Solution Preferences
- Prefers understanding root causes over quick patches
- Values structural solutions over workarounds
- Appreciates technical explanations of approaches
- Notices and reports visual/layout inconsistencies

### Testing Approach
- Comprehensive testing of both functionality and visual appearance
- Tests edge cases and integration between systems
- Provides clear feedback on what works and what doesn't
- Tests immediately after implementations

### Design Feedback
- Values information density over simplified displays
- Prefers realistic game-scale values over placeholder values
- Appreciates proper visual constraints and layout integrity
- Expects mathematical accuracy in data visualization

## Visual Design Evolution

### Color Scheme
**Established Theme**: Gold (#FFD700) and purple (#6A0DAD) for accessibility
**Background**: Dark theme (#121212) with high contrast
**Implementation**: CSS custom properties for consistent theming

### Layout Architecture
**Three-Panel Design**:
- Left: Action selection panel (25% width)
- Center: Timeline container (50% width)
- Right: Game state panel (25% width)

**Responsive Considerations**:
- Tablet: Two-panel layout (action + timeline)
- Mobile: Single-panel layout with collapsible sections

### Information Hierarchy
**Panel Organization**:
- Vitals display with capacity information
- Area resources by location
- Inventory with visual grid layout
- Current location with selector

**Timeline Enhancement**:
- Action sequence with drag-drop reordering
- Per-action controls and count display
- Disabled state visual feedback
- Time indicator and multiplier controls

## Current UI State

### Fully Functional Features
- **Timeline Interface**: Complete action management with multiplier controls
- **Vitals Graph**: SVG-based chart with interactive tooltips and proper scaling
- **Area Resources Panel**: Real-time resource display by location
- **Learning System UI**: CSV import and learning data visualization
- **Responsive Layout**: Works across different screen sizes

### User Experience Quality
- **Information Dense**: Comprehensive state information available
- **Expert-Friendly**: Detailed controls and mathematical accuracy
- **Visually Consistent**: Cohesive theming and layout principles
- **Functionally Robust**: Proper error handling and edge case management

## Future UI Considerations

### Planned Enhancements
- Horizontal zoom functionality for detailed timeline analysis
- Scale customization controls for finer grid intervals
- Configuration UI for switching between chart types
- Enhanced tooltip information display

### Architecture Benefits
- **Modular Design**: Easy to add new panels and features
- **Configurable Systems**: Centralized configuration for easy modification
- **Scalable Layout**: Supports additional game mechanics and data displays
- **Expert-Focused**: Design principles support power user workflows

## Key Insights for Future Development

### User Preferences
- Function over form, but proper visual polish matters
- Root cause solutions preferred over quick fixes
- Information density valued over simplified interfaces
- Mathematical accuracy crucial for analysis tools

### Technical Approaches
- SVG superior to HTML/CSS for data visualization
- Centralized configuration better than scattered constants
- Proper DOM structure planning prevents manipulation issues
- Container positioning context essential for layout control

### Development Philosophy
- No fallbacks during development to surface issues quickly
- User testing crucial for validating UI assumptions
- Documentation of design decisions helps future development
- Iterative improvement based on real usage feedback