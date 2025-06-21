// predictor_engine.js - Game State Evaluator
import { actions } from './actions.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const locationsData = require('../data/locations.json');
const validLocations = locationsData.locations;

export function evaluateActionList(actionList) {
    const timeline = [];
    let state = {
        air: 100,
        water: 100,
        food: 100,
        inventory: {},
        location: "Camp",
        loopNumber: 1,
        timeElapsed: 0,
        loopFailed: false,
        failureReason: null,
        failureIndex: null
    };

    const consumptionRates = {
        air: 0.1,
        water: 0.1,
        food: 0.1
    };

    const restoreFromInventory = {
        "Air Tank": { air: 100 },
        "Water Bottle": { water: 100 },
        "Food Ration": { food: 100 }
    };

    function applyVitalDrain(state, effect) {
        const duration = effect.time || 1;
        for (let vital of ["air", "water", "food"]) {
            const baseDrain = consumptionRates[vital] * duration;
            const extraDrain = (effect.extraConsumption?.[vital] || 0) * duration;
            state[vital] -= (baseDrain + extraDrain);
        }
    }

    function autoConsume(state) {
        for (let vital of ["air", "water", "food"]) {
            if (state[vital] >= 0) continue;
            const item = Object.keys(restoreFromInventory).find(k => restoreFromInventory[k][vital]);
            if (item && state.inventory[item] > 0) {
                state[vital] += restoreFromInventory[item][vital];
                state.inventory[item]--;
                if (state.inventory[item] === 0) delete state.inventory[item];
            }
        }
    }

    for (let i = 0; i < actionList.length; i++) {
        const action = actionList[i];
        const effect = actions[action] || {};

        // Validate location requirement
        let locationValid = !effect.locationRequirement || effect.locationRequirement === state.location;

        if (!locationValid) {
            timeline.push({
                index: i + 1,
                action,
                vitals: {
                    air: state.air,
                    water: state.water,
                    food: state.food
                },
                inventory: { ...state.inventory },
                location: state.location,
                timeElapsed: state.timeElapsed,
                loopFailed: false,
                failureReason: `Invalid location: must be in ${effect.locationRequirement}`
            });
            continue;
        }

        // Validate target location if action moves to a new location
        if (effect.location && !validLocations.includes(effect.location)) {
            timeline.push({
                index: i + 1,
                action,
                vitals: {
                    air: state.air,
                    water: state.water,
                    food: state.food
                },
                inventory: { ...state.inventory },
                location: state.location,
                timeElapsed: state.timeElapsed,
                loopFailed: false,
                failureReason: `Invalid target location: ${effect.location} is not a valid location`
            });
            continue;
        }

        applyVitalDrain(state, effect);
        autoConsume(state);

        state.timeElapsed += effect.time || 1;
        if (effect.inventory) {
            for (const item of effect.inventory) {
                state.inventory[item] = (state.inventory[item] || 0) + 1;
            }
        }
        if (effect.location) state.location = effect.location;

        let failed = false;
        let reason = null;
        if (state.air < 0) { failed = true; reason = "Air depleted"; }
        else if (state.water < 0) { failed = true; reason = "Water depleted"; }
        else if (state.food < 0) { failed = true; reason = "Food depleted"; }

        if (failed && !state.loopFailed) {
            state.loopFailed = true;
            state.failureReason = reason;
            state.failureIndex = i + 1;
        }

        timeline.push({
            index: i + 1,
            action,
            vitals: {
                air: state.air,
                water: state.water,
                food: state.food
            },
            inventory: { ...state.inventory },
            location: state.location,
            timeElapsed: state.timeElapsed,
            loopFailed: failed,
            failureReason: failed ? reason : null
        });
    }

    const summary = {
        finalVitals: {
            air: state.air,
            water: state.water,
            food: state.food
        },
        inventory: { ...state.inventory },
        location: state.location,
        loopFailed: state.loopFailed,
        failureReason: state.failureReason,
        failureIndex: state.failureIndex,
        loopLength: timeline.length,
        timeElapsed: state.timeElapsed
    };

    return { timeline, summary };
}

