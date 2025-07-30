# Claude Context Documentation

This documentation provides comprehensive project knowledge for future Claude sessions to understand the Predictor project without needing to re-ask questions.

## Quick Start
1. **Start with [Project Overview](project-overview.md)** - Understand what the project is and who uses it
2. **Read [User Workflows](user-workflows.md)** - Learn how different users interact with the system
3. **Review [Technical Requirements](technical-requirements.md)** - Understand target architecture and constraints
4. **Check [Architecture Decisions](architecture-decisions.md)** - Know why key technical choices were made
5. **See [Current Implementation Notes](current-implementation-notes.md)** - Understand the starting point

## Documentation Structure

### [Project Overview](project-overview.md)
High-level understanding of the Predictor application:
- Purpose and scope
- Target users and their goals
- Development status and timeline

### [User Workflows](user-workflows.md)
Detailed user behavior patterns:
- Developer usage (balance testing)
- Speedrunner usage (route optimization)
- File modification patterns and frequency

### [Technical Requirements](technical-requirements.md)
Architecture specifications and constraints:
- Target desktop application architecture
- Platform requirements (Windows primary)
- File system access and JSON handling needs

### [Architecture Decisions](architecture-decisions.md)
Key technical decisions and their rationale:
- Why Express server approach was rejected
- Why desktop app approach was chosen
- Technology selection reasoning

### [Current Implementation Notes](current-implementation-notes.md)
Status of existing codebase:
- Current Express server implementation
- Known issues and problems
- Migration considerations

## How to Use This Documentation

**For New Context**: Read documents 1-3 for essential understanding, then 4-6 for technical details.

**For Technical Decisions**: Start with Architecture Decisions, then Technical Requirements.

**For Understanding Problems**: Check Current Implementation Notes and Architecture Decisions.

**Key Principle**: Avoid implementing temporary solutions that will need to be undone later. Always align with the target desktop app architecture.