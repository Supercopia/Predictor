// familiarity.js - Action learning and familiarity system

/**
 * Calculates the speed multiplier for an action based on completion count
 * @param {number} completions - Number of times action has been completed
 * @param {string} learningType - "fast" (+0.1x) or "slow" (+0.01x), first completion gets additional +0.2x bonus
 * @returns {number} Speed multiplier (1.0 = base speed, higher = faster)
 */
export function calculateSpeedMultiplier(completions, learningType = "slow") {
    if (completions <= 0) {
        return 1.0; // Base speed for no completions
    }
    
    // Determine learning rate
    const learningRate = learningType === "fast" ? 0.1 : 0.01;
    
    // First completion gets normal bonus + additional 0.2x
    if (completions === 1) {
        return 1.0 + learningRate + 0.2; // Normal bonus + extra 0.2x
    }
    
    // Linear progression up to 3x speed
    const linearMultiplier = 1.0 + (completions * learningRate);
    
    if (linearMultiplier <= 3.0) {
        return linearMultiplier;
    }
    
    // Beyond 3x: diminishing returns approaching 4.32857x asymptote
    // For now, implement a placeholder formula - this will be updated when the final formula is provided
    const excessCompletions = completions - (2.0 / learningRate); // Completions beyond 3x threshold
    const diminishingReturns = 1.32857 * (1 - Math.exp(-excessCompletions * 0.1));
    
    return 3.0 + diminishingReturns;
}

/**
 * Calculates the effective duration for an action with learning applied
 * @param {number} baseDuration - Base action duration in seconds
 * @param {Object} learningData - Learning data {type: "completions"|"timeCompleted", value: number}
 * @param {string} learningType - "fast" or "slow" learning type
 * @returns {number} Effective duration in seconds
 */
export function calculateActionDuration(baseDuration, learningData, learningType = "slow") {
    console.log(`calculateActionDuration called: baseDuration=${baseDuration}, learningData=`, learningData, `learningType=${learningType}`);
    
    if (!learningData || learningData.value <= 0) {
        console.log(`No learning data, returning base duration: ${baseDuration}`);
        return baseDuration; // No learning data = base duration
    }
    
    if (learningData.type === "completions") {
        // Standard completion-based learning
        const speedMultiplier = calculateSpeedMultiplier(learningData.value, learningType);
        const finalDuration = baseDuration / speedMultiplier;
        console.log(`Completions learning: ${learningData.value} completions → ${speedMultiplier.toFixed(2)}x speed → ${baseDuration}s becomes ${finalDuration.toFixed(2)}s`);
        return finalDuration;
    } else if (learningData.type === "timeCompleted") {
        // Partial completion: first X seconds get +0.1x bonus
        const partialTime = Math.min(learningData.value, baseDuration);
        const remainingTime = baseDuration - partialTime;
        
        const acceleratedPartialDuration = partialTime / 1.1; // +0.1x speed bonus
        const normalRemainingDuration = remainingTime; // Base speed
        
        return acceleratedPartialDuration + normalRemainingDuration;
    }
    
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
    if (!learningState[actionName]) {
        learningState[actionName] = { type: 'completions', value: 0 };
    }
    
    const currentData = learningState[actionName];
    
    if (currentData.type === 'timeCompleted') {
        // First full completion - convert from partial to full completions
        learningState[actionName] = { type: 'completions', value: 1 };
    } else {
        // Increment completion count
        learningState[actionName] = { 
            type: 'completions', 
            value: currentData.value + 1 
        };
    }
    
    return learningState[actionName];
}

/**
 * Checks if an action should bypass the learning system
 * @param {string} actionName - Name of the action
 * @returns {boolean} True if action should bypass learning
 */
export function shouldBypassLearning(actionName) {
    // "Wait" is the only action that bypasses learning
    return actionName === "Meta.Wait" || actionName === "Wait";
}

/**
 * Gets the learning type for an action from the actions database
 * @param {string} actionName - Name of the action
 * @param {Object} actions - Actions database
 * @returns {string} "fast" or "slow"
 */
export function getLearningType(actionName, actions) {
    const action = actions[actionName];
    if (!action) {
        console.warn(`Action "${actionName}" not found in actions database`);
        return "slow"; // Default to slow learning
    }
    
    return action.learningType || "slow"; // Default to slow if not specified
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