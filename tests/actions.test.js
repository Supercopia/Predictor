import { actions } from '../src/actions.js';

describe('Actions', () => {
    test('should have required properties for each action', () => {
        Object.entries(actions).forEach(([name, action]) => {
            // Every action should have a time cost
            expect(action).toHaveProperty('time');
            expect(typeof action.time).toBe('number');

            // If action has inventory effects, they should be arrays
            if (action.inventory) {
                expect(Array.isArray(action.inventory)).toBe(true);
            }

            // If action changes location, it should have both target and requirement
            if (action.location) {
                expect(typeof action.location).toBe('string');
                expect(action).toHaveProperty('locationRequirement');
            }

            // Extra consumption should be an object with valid vital properties
            if (action.extraConsumption) {
                expect(typeof action.extraConsumption).toBe('object');
                Object.values(action.extraConsumption).forEach(rate => {
                    expect(typeof rate).toBe('number');
                });
            }
        });
    });

    test('should have valid location chains', () => {
        // Build a map of valid location transitions
        const locationMap = new Map();
        Object.values(actions).forEach(action => {
            if (action.location && action.locationRequirement) {
                if (!locationMap.has(action.locationRequirement)) {
                    locationMap.set(action.locationRequirement, new Set());
                }
                locationMap.get(action.locationRequirement).add(action.location);
            }
        });

        // Verify we can reach all locations from Camp
        const reachable = new Set(['Camp']);
        let changed;
        do {
            changed = false;
            reachable.forEach(loc => {
                const destinations = locationMap.get(loc);
                if (destinations) {
                    destinations.forEach(dest => {
                        if (!reachable.has(dest)) {
                            reachable.add(dest);
                            changed = true;
                        }
                    });
                }
            });
        } while (changed);

        // All locations mentioned should be reachable
        const allLocations = new Set();
        Object.values(actions).forEach(action => {
            if (action.location) allLocations.add(action.location);
            if (action.locationRequirement) allLocations.add(action.locationRequirement);
        });

        allLocations.forEach(location => {
            expect(reachable.has(location)).toBe(true);
        });
    });
});
