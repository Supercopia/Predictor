# Historical Development Guidelines

This document outlines the original development rules established for this project when it was being developed with ChatGPT. These rules are preserved for historical context and understanding of the project's initial development approach.

## Core Development Principles

### Code Quality
- Prioritize simplicity over complexity
- Avoid code repetition; favor reuse
- Keep files concise (200-300 lines max)
- Follow SOLID principles where applicable

### Project Structure
- Backend: JavaScript
- Frontend: HTML and JavaScript
- Data Storage: SQL databases (no JSON files)
- Testing: JavaScript

### Documentation Requirements
- Component documentation in `/docs/[component].md`
- Log completed work in `progress.md`
- Track upcoming tasks in `TODO.txt`
- Document large changes in `plan.md`
- Summarize context in `context-summary.md` if exceeding 100k tokens

### Development Workflow
- Break large tasks into stages
- Require approval between stages
- Never modify unspecified code
- No mock data in dev/prod (tests only)
- Comprehensive testing for major features
- Classify changes as Small, Medium, or Large

### Communication Protocol
- Begin responses with random emoji
- Optimize for token efficiency
- Seek clarification before proceeding
- State completion status clearly
- Extra care when urgency is indicated

### Change Management
- Implementation plan required for Large changes
- No stack changes without explicit approval
- Adjust checkpoint frequency based on feedback

## Historical Note
These guidelines were established during the project's initial development phase with ChatGPT. They are preserved here for historical context and to understand the project's evolution.
