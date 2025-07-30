# Architecture Decisions

## Major Architectural Decision: Desktop App vs. Web Server

### Decision: Migrate from Express Server to Desktop Application

**Previous Approach**: Express.js server with browser frontend
**New Approach**: Packaged desktop application with external JSON files

### Why Express Server Was Rejected

**Original Implementation**:
- Express.js server serving static files and JSON data
- Browser-based frontend accessing server via HTTP requests
- Implemented by previous AI assistant

**Problems Identified**:
1. **Distribution Complexity**: Users need to install Node.js and run `npm start`
2. **User Experience**: Technical barrier for end users (speedrunners)
3. **Architecture Mismatch**: Server approach doesn't align with local, single-user requirements
4. **File Access Limitations**: HTTP requests instead of direct file system access
5. **Sharing Workflow**: Complex for users who want to share configurations

**Key Insight**: "I'm not really sure why we're using it, probably needs to be reworked" - The server was implemented without clear justification for project needs.

### Why Desktop Application Was Chosen

**Requirements That Led to This Decision**:
- **Double-click executable**: User preference for simple launch
- **Direct file system access**: Need to read/write JSON files wherever user places app
- **No Node.js requirement**: Prefer users don't need to install dependencies
- **Easy sharing**: Users should be able to copy JSON files to share configurations
- **Local operation**: No network dependencies or remote servers

**Solution Alignment**:
- **Option C**: Packaged executable with external JSON files
- **Best of both worlds**: Professional app experience + visible/shareable data files
- **Windows primary**: Matches user base and platform requirements

## Technology Selection Decisions

### Primary Technology: Electron (Recommended)

**Why Electron**:
- **Proven Solution**: Well-established for web-to-desktop transitions
- **Code Reuse**: Can leverage existing HTML/CSS/JavaScript frontend
- **File System Access**: Native file system APIs available
- **Cross-Platform**: Works on Windows (required) and other platforms (bonus)
- **Packaging**: Built-in tools for creating standalone executables

**Alternative Technologies Considered**:
- **Tauri**: Rust-based, smaller footprint, but more complex migration
- **Native Apps**: Platform-specific but requires complete rewrite
- **Script + Batch Files**: Simple but still requires Node.js for users

### Data Loading Architecture Decision

**Previous Approach**: HTTP requests to server endpoints
**New Approach**: Direct file system access with error handling

**Benefits of File System Access**:
- **Performance**: Eliminates HTTP overhead (~100-400ms per request)
- **Reliability**: No network failures or routing issues
- **Simplicity**: Direct data access without server complexity
- **User Control**: Users can modify files directly if needed (for sharing)

## Development Philosophy Decisions

### Principle: Avoid Temporary Solutions

**Core Principle**: "I prefer not to do anything that I will have to undo later"

**Applied To**:
- **No Express fixes**: Instead of fixing server routing issues, migrate to target architecture
- **No temporary patches**: Instead of bandaid solutions, implement proper long-term approach
- **Forward compatibility**: Choose solutions that align with final goals

**Impact on Development**:
- **Skip intermediate steps**: Move directly to desktop app instead of fixing current issues
- **Focus on end state**: Build what will be needed, not what works temporarily
- **Avoid rework**: Don't create code that will be discarded

### Decision: Build Desktop App for Demo

**Requirement**: Demo needs to work on others' computers easily
**Options Considered**:
- Use current Express approach (requires Node.js installation)
- Build desktop app version for demo
- Host temporarily on web server

**Decision**: Build desktop app for demo
**Reasoning**: 
- No time pressure ("there's no time pressure")
- Aligns with final architecture
- Better user experience for demo recipients
- Avoids temporary solution that would be discarded

## Scale-Appropriate Technology Decisions

### Rejected Over-Engineering Solutions

Based on project scale (10-20 total users, small fan project):

**Database Approach**: Rejected
- **Why**: Massive over-engineering for 4 small config files
- **Scale mismatch**: Enterprise database for simple data management
- **Complexity unjustified**: High setup cost for data that rarely changes

**Complex Build Systems**: Avoided
- **Why**: Build systems are overkill for 4 small JSON files  
- **Scale mismatch**: Enterprise-level tooling for simple data management
- **Maintenance burden**: High setup cost for minimal benefit

**Microservices/API Architecture**: Rejected
- **Why**: Solving problems that don't exist at this scale
- **User mismatch**: Reduces accessibility for research/development tool

### Scale-Appropriate Choices

**Simple Desktop App**: Matches project scale
- **User-friendly**: Appropriate for small fan community
- **File-based sharing**: Simple configuration exchange
- **Direct approach**: No unnecessary abstraction layers

## Data Management Decisions

### JSON Files vs. Database

**Decision**: Keep JSON files
**Reasoning**:
- **User familiarity**: Users already understand the JSON structure
- **Easy sharing**: Simple file copying for configuration exchange
- **Appropriate scale**: 4 small files don't justify database complexity
- **Direct editing**: Users can modify files if needed (backup/emergency)
- **Version control friendly**: JSON files work well with git for project development

### File Location Strategy

**Decision**: External JSON files alongside executable
**Reasoning**:
- **Sharing requirement**: Users need to copy files to share configurations
- **User accessibility**: Files visible for backup, modification, troubleshooting
- **Portability**: Application works from any directory location
- **Development workflow**: Easy to modify during development

## Future Architecture Considerations

### Custom UI Integration

**Decision**: Build integrated editing UI
**Status**: Definitive plan, details to be worked out
**Reasoning**:
- **User experience**: Better than direct JSON editing
- **Data validation**: Prevent invalid configurations
- **Professional feel**: More polished than raw file editing

### Extensibility Planning

**Forward compatibility**: Architecture chosen supports:
- **Graph generation and comparison**: For balance testing workflows
- **Save/load configurations**: For baseline comparisons
- **Additional data types**: Room for future game data additions

## Related Documentation

- See [Technical Requirements](technical-requirements.md) for specifications driven by these decisions
- See [User Workflows](user-workflows.md) for requirements that influenced these choices
- See [Current Implementation Notes](current-implementation-notes.md) for migration implications