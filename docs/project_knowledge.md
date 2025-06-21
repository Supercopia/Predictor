# Project Knowledge Summary - Loop Predictor Tool

## 🎯 Purpose

A standalone tool designed to simulate and analyze a text-based, single-player exploration game with time-loop mechanics. It helps both players (for optimization) and developers (for balancing).

## 🔄 Core Concepts

### Vitals
Air, water, food — if any drop below 0, the loop fails.

### Inventory
Items like Air Tank, Water Bottle, Food Ration — tracked by quantity. Used to restore vitals automatically when they fall below 0.

### Actions
Atomic game events like "Take Food Ration" or "Travel to Canyon". Each:
- Has a time cost in seconds
- Depletes vitals based on a passive rate (-0.1/s) + optional extra drain
- May provide inventory items
- May change location
- Requires the player to be at one or more specific locations (locationRequirement)

### State Tracking
- Turn number
- Time elapsed
- Vitals
- Inventory
- Current location
- Loop status (failed or not)

## ✅ Features Implemented

- Core engine (predictor_engine.js) to evaluate an action list and return a timeline + summary
- Inventory auto-consumption logic
- JSON-based action definitions with schema validation
- Dynamic location validation from locations.json
- Runtime action modifications (add/modify/remove)
- Loop failure detection
- Test suite for actions system
- Color-coded vitals (frontend planned)
- Scrollable UI planned with per-action hoverable inventory

## 📁 Current Files

### Source Code
- `src/predictor_engine.js`: Game state evaluator
- `src/actions_manager.js`: Runtime action management and validation

### Data Files
- `data/actions.json`: Action definitions with time, inventory, location requirements
- `data/locations.json`: Valid game locations

### Schemas
- `schemas/actions.schema.json`: JSON schema for action validation
- `schemas/config.schema.json`: JSON schema for game configuration

### Tests
- `tests/test_actions_manager.js`: Tests for action management system

### Documentation
- `docs/progress.md`: General project log
- `docs/code_progress.md`: Code-specific changelog
- `docs/project_knowledge.md`: (this file)

## ✔️ Rules & Workflow

- No code or file changes can be made unless the user explicitly says: "Yes, proceed."
- Any variation ("Yes.", "Go ahead.", etc.) is not accepted
- All work must be logged in progress.md or code_progress.md, depending on context
- Logs must include: Author, Type, Timestamp, Approval, Testing, Impact, Tags, and Rollback status
