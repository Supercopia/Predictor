// familiarity.js - Action learning and familiarity system
import { constants } from './constants.js';

/**
 * Calculates the speed multiplier for an action based on completion count
 * @param {number} completions - Number of times action has been completed
 * @param {string} learningType - "fast" (+0.1x) or "slow" (+0.01x), first completion gets additional +0.2x bonus
 * @returns {number} Speed multiplier (1.0 = base speed, higher = faster)
 */
export function calculateSpeedMultiplier(completions, learningType = "slow") {
    console.log(`[FAMILIARITY] calculateSpeedMultiplier ENTRY: completions=${completions}, learningType="${learningType}"`);
    console.log(`[FAMILIARITY] Parameter types: completions=${typeof completions}, learningType=${typeof learningType}`);
    console.log(`[FAMILIARITY] Parameter validation: completions isNaN=${isNaN(completions)}, isFinite=${isFinite(completions)}`);
    
    if (completions <= 0) {
        console.log(`[FAMILIARITY] No completions (${completions} <= 0), returning base speed 1.0`);
        return constants.familiarity.baseSpeedMultiplier; // Base speed for no completions
    }
    
    // Determine learning rate
    const learningRate = learningType === "fast" ? constants.familiarity.fastLearningRate : constants.familiarity.slowLearningRate;
    console.log(`[FAMILIARITY] Learning rate determined: ${learningRate} (type: ${learningType})`);
    
    // All completions get linear progression + first completion bonus
    const linearMultiplier = constants.familiarity.baseSpeedMultiplier + (completions * learningRate) + constants.familiarity.firstCompletionBonus;
    console.log(`[FAMILIARITY] Linear multiplier: 1.0 + (${completions} × ${learningRate}) + 0.2 = ${linearMultiplier}`);
    
    if (linearMultiplier <= constants.familiarity.softCap) {
        console.log(`[FAMILIARITY] Using linear multiplier: ${linearMultiplier} (≤ ${constants.familiarity.softCap})`);
        return linearMultiplier;
    }
    
    // Beyond softcap: diminishing returns using geometric series
    // Calculate how much linear progression exceeded the soft cap
    const bonusOverCap = linearMultiplier - constants.familiarity.softCap;
    const completionsOverCap = bonusOverCap / learningRate;
    console.log(`[FAMILIARITY] Diminishing returns: bonusOverCap=${bonusOverCap}, completionsOverCap=${completionsOverCap}`);
    
    // Use geometric series formula: a * (1 - r^n) / (1 - r)
    const a = constants.familiarity.fastLearningRate; // Base multiplier is always fast learning rate
    const r = constants.familiarity.reductionFactor;
    const diminishedExcess = a * (1 - Math.pow(r, completionsOverCap)) / (1 - r);
    console.log(`[FAMILIARITY] Geometric series: ${a} * (1 - ${r}^${completionsOverCap}) / (1 - ${r}) = ${diminishedExcess}`);
    
    const finalMultiplier = constants.familiarity.softCap + diminishedExcess;
    console.log(`[FAMILIARITY] Final multiplier: 3.0 + ${diminishingReturns} = ${finalMultiplier}`);
    console.log(`[FAMILIARITY] Validation: isNaN=${isNaN(finalMultiplier)}, isFinite=${isFinite(finalMultiplier)}, isInfinity=${finalMultiplier === Infinity}`);
    
    return finalMultiplier;
}

/**
 * Calculates the effective duration for an action with learning applied
 * @param {number} baseDuration - Base action duration in seconds
 * @param {Object} learningData - Learning data {type: "completions"|"timeCompleted", value: number}
 * @param {string} learningType - "fast" or "slow" learning type
 * @returns {number} Effective duration in seconds
 */
export function calculateActionDuration(baseDuration, learningData, learningType = "slow") {
    console.log(`[FAMILIARITY] calculateActionDuration ENTRY: baseDuration=${baseDuration}, learningType="${learningType}"`);
    console.log(`[FAMILIARITY] Learning data:`, learningData);
    console.log(`[FAMILIARITY] Parameter types: baseDuration=${typeof baseDuration}, learningType=${typeof learningType}`);
    console.log(`[FAMILIARITY] Parameter validation: baseDuration isNaN=${isNaN(baseDuration)}, isFinite=${isFinite(baseDuration)}`);
    
    if (!learningData) {
        console.log(`[FAMILIARITY] No learning data (null/undefined), returning base duration: ${baseDuration}`);
        return baseDuration;
    }
    
    if (learningData.value <= 0) {
        console.log(`[FAMILIARITY] No learning progress (value=${learningData.value} <= 0), returning base duration: ${baseDuration}`);
        return baseDuration;
    }
    
    console.log(`[FAMILIARITY] Processing learning data: type="${learningData.type}", value=${learningData.value}`);
    
    if (learningData.type === "completions") {
        console.log(`[FAMILIARITY] Using completion-based learning`);
        // Standard completion-based learning
        const speedMultiplier = calculateSpeedMultiplier(learningData.value, learningType);
        console.log(`[FAMILIARITY] Speed multiplier calculated: ${speedMultiplier}`);
        console.log(`[FAMILIARITY] Multiplier validation: isNaN=${isNaN(speedMultiplier)}, isFinite=${isFinite(speedMultiplier)}, isInfinity=${speedMultiplier === Infinity}`);
        
        const finalDuration = baseDuration / speedMultiplier;
        console.log(`[FAMILIARITY] Duration calculation: ${baseDuration} / ${speedMultiplier} = ${finalDuration}`);
        console.log(`[FAMILIARITY] Final duration validation: isNaN=${isNaN(finalDuration)}, isFinite=${isFinite(finalDuration)}, isInfinity=${finalDuration === Infinity}`);
        
        console.log(`[FAMILIARITY] Completions learning: ${learningData.value} completions → ${speedMultiplier.toFixed(2)}x speed → ${baseDuration}s becomes ${finalDuration.toFixed(2)}s`);
        return finalDuration;
    } else if (learningData.type === "timeCompleted") {
        console.log(`[FAMILIARITY] Using time-based learning`);
        // Partial completion: first X seconds get +0.1x bonus
        const partialTime = Math.min(learningData.value, baseDuration);
        const remainingTime = baseDuration - partialTime;
        console.log(`[FAMILIARITY] Time breakdown: partial=${partialTime}, remaining=${remainingTime}`);
        
        const acceleratedPartialDuration = partialTime / constants.familiarity.partialCompletionBonus; // Partial completion speed bonus
        const normalRemainingDuration = remainingTime; // Base speed
        const totalDuration = acceleratedPartialDuration + normalRemainingDuration;
        console.log(`[FAMILIARITY] Time calculation: ${partialTime}/1.1 + ${remainingTime} = ${totalDuration}`);
        
        return totalDuration;
    }
    
    console.log(`[FAMILIARITY] Unknown learning type "${learningData.type}", returning base duration: ${baseDuration}`);
    return baseDuration; // Fallback to base duration
}

/**
 * Creates initial learning state from parsed CSV data
 * @param {Object} csvLearningData - Parsed learning data from CSV
 * @param {Object} actions - Actions database for validation
 * @returns {Object} Learning state object
 */
export function initializeLearningState(csvLearningData, actions) {
    const learningState = {};
    
    // Initialize all actions to 0 completions
    for (const actionName in actions) {
        learningState[actionName] = {
            type: 'completions',
            value: 0
        };
    }
    
    // Apply CSV data where available
    for (const [actionIdentifier, learningData] of Object.entries(csvLearningData)) {
        // Map action identifier to action name (may need adjustment based on real data format)
        if (actions[actionIdentifier]) {
            learningState[actionIdentifier] = learningData;
        } else {
            console.warn(`Action "${actionIdentifier}" in learning CSV not found in actions database`);
        }
    }
    
    return learningState;
}

/**
 * Increments completion count for an action during simulation
 * @param {Object} learningState - Current learning state
 * @param {string} actionName - Name of the action
 * @returns {Object} Updated learning state entry
 */
export function incrementCompletion(learningState, actionName) {
    console.log(`[FAMILIARITY] incrementCompletion ENTRY: actionName="${actionName}"`);
    console.log(`[FAMILIARITY] Current learning state keys:`, Object.keys(learningState));
    
    if (!learningState[actionName]) {
        console.log(`[FAMILIARITY] No existing data for "${actionName}", creating new entry`);
        learningState[actionName] = { type: 'completions', value: 0 };
    }
    
    const currentData = learningState[actionName];
    console.log(`[FAMILIARITY] Current data for "${actionName}":`, currentData);
    
    if (currentData.type === 'timeCompleted') {
        console.log(`[FAMILIARITY] Converting timeCompleted to first completion`);
        // First full completion - convert from partial to full completions
        learningState[actionName] = { type: 'completions', value: 1 };
    } else {
        console.log(`[FAMILIARITY] Incrementing completion count from ${currentData.value} to ${currentData.value + 1}`);
        // Increment completion count
        learningState[actionName] = { 
            type: 'completions', 
            value: currentData.value + 1 
        };
    }
    
    console.log(`[FAMILIARITY] Updated data for "${actionName}":`, learningState[actionName]);
    return learningState[actionName];
}

/**
 * Checks if an action should bypass the learning system
 * @param {string} actionName - Name of the action
 * @returns {boolean} True if action should bypass learning
 */
export function shouldBypassLearning(actionName) {
    console.log(`[FAMILIARITY] shouldBypassLearning ENTRY: actionName="${actionName}"`);
    // "Wait" is the only action that bypasses learning
    const shouldBypass = actionName === "Meta.Wait" || actionName === "Wait";
    console.log(`[FAMILIARITY] Bypass decision: ${shouldBypass}`);
    return shouldBypass;
}

/**
 * Gets the learning type for an action from the actions database
 * @param {string} actionName - Name of the action
 * @param {Object} actions - Actions database
 * @returns {string} "fast" or "slow"
 */
export function getLearningType(actionName, actions) {
    console.log(`[FAMILIARITY] getLearningType ENTRY: actionName="${actionName}"`);
    console.log(`[FAMILIARITY] Actions database type:`, typeof actions);
    console.log(`[FAMILIARITY] Actions database keys (first 10):`, Object.keys(actions || {}).slice(0, 10));
    
    const action = actions[actionName];
    console.log(`[FAMILIARITY] Action lookup result:`, action);
    
    if (!action) {
        console.warn(`[FAMILIARITY] Action "${actionName}" not found in actions database`);
        console.log(`[FAMILIARITY] Returning default learning type: "slow"`);
        return "slow"; // Default to slow learning
    }
    
    const learningType = action.learningType || "slow";
    console.log(`[FAMILIARITY] Learning type determined: "${learningType}" (from action.learningType="${action.learningType}")`);
    return learningType;
}

/**
 * Formats learning information for display
 * @param {Object} learningData - Learning data entry
 * @param {number} speedMultiplier - Calculated speed multiplier
 * @returns {string} Formatted learning info
 */
export function formatLearningInfo(learningData, speedMultiplier) {
    if (!learningData || learningData.value <= 0) {
        return "No experience";
    }
    
    if (learningData.type === "completions") {
        return `${learningData.value} completions (${speedMultiplier.toFixed(2)}x speed)`;
    } else if (learningData.type === "timeCompleted") {
        return `${learningData.value}s partial (1.1x speed for first ${learningData.value}s)`;
    }
    
    return "Unknown learning state";
}