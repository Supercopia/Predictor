// predictor_engine.js - Game State Evaluator
import { actions } from './actions.js';
import { 
    calculateActionDuration, 
    incrementCompletion, 
    shouldBypassLearning, 
    getLearningType 
} from './familiarity.js';
import { AreaResources } from './area_resources.js';
import { Events } from './events.js';

// Load locations data for validation
let validLocations = ["Camp", "Laurion", "Canyon", "Volcano", "Desert", "Mountain Peak"];

// Try to load locations dynamically
(async () => {
    try {
        const response = await fetch('/data/locations.json');
        const locationsData = await response.json();
        validLocations = locationsData.locations.map(loc => typeof loc === 'string' ? loc : loc.name);
        console.log('Loaded locations:', validLocations);
    } catch (error) {
        console.warn('Failed to load locations.json, using defaults:', error);
    }
})();

export function evaluateActionList(actionList, learningState = {}) {
    const timeline = [];
    let state = {
        air: 10,
        water: 10,
        food: 10,
        airCapacity: 10,
        waterCapacity: 10,
        foodCapacity: 10,
        inventory: {},
        location: "Camp",
        loopNumber: 1,
        timeElapsed: 0,
        loopFailed: false,
        failureReason: null,
        failureIndex: null
    };
    
    // Initialize area resources and events
    const areaResources = new AreaResources();
    const events = new Events();
    
    // Create a working copy of learning state for this simulation
    const currentLearningState = JSON.parse(JSON.stringify(learningState));

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

    function applyVitalDrain(state, effect, areaResources, events) {
        const duration = effect.time || 1;
        for (let vital of ["air", "water", "food"]) {
            // Skip food drain during satiated period (0-60s)
            if (vital === "food" && !events.isHungerActive(state.timeElapsed)) {
                continue;
            }
            
            const baseDrain = consumptionRates[vital] * duration;
            const extraDrain = (effect.extraConsumption?.[vital] || 0) * duration;
            const totalDrain = baseDrain + extraDrain;
            
            // Try to consume from area resources first
            const areaConsumed = areaResources.consumeAreaResource(state.location, vital, totalDrain);
            const remainingDrain = totalDrain - areaConsumed;
            
            // Apply remaining drain to personal vitals
            state[vital] -= remainingDrain;
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
                capacities: {
                    airCapacity: state.airCapacity,
                    waterCapacity: state.waterCapacity,
                    foodCapacity: state.foodCapacity
                },
                inventory: { ...state.inventory },
                location: state.location,
                timeElapsed: state.timeElapsed,
                loopFailed: false,
                failureReason: `Invalid location: must be in ${effect.locationRequirement}`,
                actionDuration: 0,
                baseDuration: effect.time || 1,
                learningData: null,
                areaResources: areaResources.getAllResources(),
                events: events.getEventStatus(state.timeElapsed)
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
                capacities: {
                    airCapacity: state.airCapacity,
                    waterCapacity: state.waterCapacity,
                    foodCapacity: state.foodCapacity
                },
                inventory: { ...state.inventory },
                location: state.location,
                timeElapsed: state.timeElapsed,
                loopFailed: false,
                failureReason: `Invalid target location: ${effect.location} is not a valid location`,
                actionDuration: 0,
                baseDuration: effect.time || 1,
                learningData: null,
                areaResources: areaResources.getAllResources(),
                events: events.getEventStatus(state.timeElapsed)
            });
            continue;
        }

        // Calculate actual action duration with learning applied
        let actionDuration;
        console.log(`Processing action: "${action}"`);
        console.log(`shouldBypassLearning(${action}):`, shouldBypassLearning(action));
        
        if (shouldBypassLearning(action)) {
            // Wait action uses base time, no learning
            actionDuration = effect.time || 1;
            console.log(`Action "${action}" bypassed learning, using base duration: ${actionDuration}`);
        } else {
            const baseDuration = effect.time || 1;
            const actionLearningData = currentLearningState[action] || { type: 'completions', value: 0 };
            const learningType = getLearningType(action, actions);
            console.log(`Action "${action}" learning data:`, actionLearningData, `type: ${learningType}`);
            actionDuration = calculateActionDuration(baseDuration, actionLearningData, learningType);
            console.log(`Action "${action}" final duration: ${actionDuration} (from base ${baseDuration})`);
        }

        // Process events at current time
        events.processEvents(state.timeElapsed, state, areaResources);
        
        // Apply area resource generation during action
        for (const location of ['Talos', 'Laurion', 'Santorini']) {
            for (const resourceType of ['air', 'water', 'food', 'power']) {
                areaResources.applyGeneration(location, resourceType, actionDuration);
            }
        }
        
        // Apply vital drain using actual duration
        const effectWithLearning = { ...effect, time: actionDuration };
        applyVitalDrain(state, effectWithLearning, areaResources, events);
        autoConsume(state);

        state.timeElapsed += actionDuration;
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

        // Increment learning for successful action completion
        if (!shouldBypassLearning(action)) {
            incrementCompletion(currentLearningState, action);
        }

        const areaResourcesData = areaResources.getAllResources();
        const eventsData = events.getEventStatus(state.timeElapsed);
        console.log('Adding to timeline - area resources:', areaResourcesData);
        console.log('Adding to timeline - events:', eventsData);
        
        timeline.push({
            index: i + 1,
            action,
            vitals: {
                air: state.air,
                water: state.water,
                food: state.food
            },
            capacities: {
                airCapacity: state.airCapacity,
                waterCapacity: state.waterCapacity,
                foodCapacity: state.foodCapacity
            },
            inventory: { ...state.inventory },
            location: state.location,
            timeElapsed: state.timeElapsed,
            loopFailed: failed,
            failureReason: failed ? reason : null,
            actionDuration: actionDuration,
            baseDuration: effect.time || 1,
            learningData: currentLearningState[action] ? { ...currentLearningState[action] } : null,
            areaResources: areaResourcesData,
            events: eventsData
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

