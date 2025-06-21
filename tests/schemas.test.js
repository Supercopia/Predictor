import Ajv from 'ajv';
import actionsSchema from '../schemas/actions.schema.json' assert { type: 'json' };
import configSchema from '../schemas/config.schema.json' assert { type: 'json' };
import saveStateSchema from '../schemas/save-state.schema.json' assert { type: 'json' };
import { actions } from '../src/actions.js';

const ajv = new Ajv({strict: true, allErrors: true});
ajv.addFormat('date-time', (data) => {
    return !isNaN(Date.parse(data));
});

describe('JSON Schemas', () => {
    describe('Actions Schema', () => {
        const validate = ajv.compile(actionsSchema);

        test('validates current actions.js content', () => {
            expect(validate(actions)).toBe(true);
        });

        test('rejects invalid action time', () => {
            const invalidAction = {
                "Test Action": {
                    time: -1
                }
            };
            expect(validate(invalidAction)).toBe(false);
        });

        // Note: Location validation is done at runtime in predictor_engine.js
        // The schema accepts any string for location fields, and validation
        // against locations.json happens dynamically during execution

        test('validates extra consumption rates', () => {
            const validAction = {
                "Test Action": {
                    time: 1,
                    extraConsumption: {
                        water: 0.5,
                        food: 0.3
                    }
                }
            };
            expect(validate(validAction)).toBe(true);
        });
    });

    describe('Config Schema', () => {
        const validate = ajv.compile(configSchema);

        test('validates default configuration', () => {
            const config = {
                vitals: {
                    air: { initial: 100, consumptionRate: 0.1 },
                    water: { initial: 100, consumptionRate: 0.1 },
                    food: { initial: 100, consumptionRate: 0.1 }
                },
                startingLocation: "Camp",
                startingInventory: {
                    "Food Ration": 1
                }
            };
            expect(validate(config)).toBe(true);
        });

        test('rejects invalid vital configuration', () => {
            const invalidConfig = {
                vitals: {
                    air: { initial: 100 }, // missing required consumptionRate
                    water: { initial: "100", consumptionRate: 0.1 }, // wrong type for initial
                    food: { initial: 100, consumptionRate: "fast" } // wrong type for consumptionRate
                }
            };
            expect(validate(invalidConfig)).toBe(false);
        });
    });

    describe('Save State Schema', () => {
        const validate = ajv.compile(saveStateSchema);

        test('validates example save state', () => {
            const saveState = {
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                gameState: {
                    vitals: {
                        air: 100,
                        water: 100,
                        food: 100
                    },
                    inventory: {
                        "Food Ration": 1
                    },
                    location: "Camp",
                    timeElapsed: 0
                },
                timeline: [{
                    index: 1,
                    action: "Take Food Ration",
                    vitals: {
                        air: 99.9,
                        water: 99.9,
                        food: 99.9
                    },
                    inventory: {
                        "Food Ration": 1
                    },
                    location: "Camp",
                    timeElapsed: 1,
                    loopFailed: false
                }]
            };
            expect(validate(saveState)).toBe(true);
        });

        test('rejects invalid timeline entry', () => {
            const invalidSave = {
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                gameState: {
                    vitals: {
                        air: 100,
                        water: 100,
                        food: 100
                    },
                    inventory: {},
                    location: "Camp",
                    timeElapsed: 0
                },
                timeline: [{
                    // Missing required fields
                    action: "Take Food Ration"
                }]
            };
            expect(validate(invalidSave)).toBe(false);
        });
    });
});
