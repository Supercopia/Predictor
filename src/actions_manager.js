const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const actionsSchema = require('../schemas/actions.schema.json');
const ajv = new Ajv({ strict: true, allErrors: true });
const validate = ajv.compile(actionsSchema);

class ActionsManager {
    constructor() {
        this.actions = {};
        this.locations = [];
        this.jsonPath = path.join(__dirname, '..', 'data', 'actions.json');
        this.locationsPath = path.join(__dirname, '..', 'data', 'locations.json');
    }

    loadLocations() {
        try {
            console.log('Loading locations from:', this.locationsPath);
            const data = fs.readFileSync(this.locationsPath, 'utf8');
            const locationsData = JSON.parse(data);
            this.locations = locationsData.locations;
            console.log('Loaded locations:', this.locations);
        } catch (error) {
            console.error('Error loading locations:', error);
            if (error.code === 'ENOENT') {
                this.locations = [];
            } else {
                throw error;
            }
        }
    }

    validateLocation(location) {
        console.log('Validating location:', location);
        console.log('Current locations:', this.locations);
        console.log('Includes check:', this.locations.includes(location));
        if (!this.locations.includes(location)) {
            throw new Error(`Invalid location: ${location}. Valid locations are: ${this.locations.join(', ')}`);
        }
    }

    validateAction(action) {
        // Create a temporary object with a single action to validate against schema
        const testObj = { testAction: action };
        if (!validate(testObj)) {
            throw new Error('Invalid action structure: ' + ajv.errorsText(validate.errors));
        }
        if (action.location) {
            this.validateLocation(action.location);
        }
        if (action.locationRequirement) {
            this.validateLocation(action.locationRequirement);
        }
    }

    load() {
        try {
            const data = fs.readFileSync(this.jsonPath, 'utf8');
            const actions = JSON.parse(data);
            if (!validate(actions)) {
                throw new Error('Invalid actions data: ' + ajv.errorsText(validate.errors));
            }
            this.actions = actions;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist yet, use empty actions object
                this.actions = {};
            } else {
                throw error;
            }
        }
    }

    save() {
        if (!validate(this.actions)) {
            throw new Error('Cannot save invalid actions: ' + ajv.errorsText(validate.errors));
        }
        const dir = path.dirname(this.jsonPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.jsonPath, JSON.stringify(this.actions, null, 4));
    }

    getActions() {
        return this.actions;
    }

    addAction(name, action) {
        this.validateAction(action);
        this.actions[name] = action;
        this.save();
    }

    removeAction(name) {
        if (!(name in this.actions)) {
            throw new Error(`Action "${name}" not found`);
        }
        const { [name]: removed, ...remaining } = this.actions;
        this.actions = remaining;
        this.save();
    }

    modifyAction(name, updates) {
        if (!(name in this.actions)) {
            throw new Error(`Action "${name}" not found`);
        }
        const updatedAction = { ...this.actions[name], ...updates };
        this.validateAction(updatedAction);
        this.actions[name] = updatedAction;
        this.save();
    }
}

// Create a singleton instance
const manager = new ActionsManager();
manager.loadLocations();
manager.load();

if (typeof module !== 'undefined') {
    module.exports = { 
        actions: manager.getActions(), 
        ActionsManager,
        // Export the singleton instance
        manager
    };
}
