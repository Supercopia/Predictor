// csv_parser.js - CSV parsing utilities for learning data import

/**
 * Parses learning data CSV with format: actionIdentifier,completions,timeCompleted
 * Each action has either completions OR timeCompleted, never both
 * @param {string} csvContent - Raw CSV content
 * @returns {Object} Learning data object with action identifiers as keys
 */
export function parseLearningCSV(csvContent) {
    const learningData = {};
    
    if (!csvContent || typeof csvContent !== 'string') {
        console.warn('Invalid CSV content provided to parseLearningCSV');
        return learningData;
    }
    
    const lines = csvContent.trim().split('\n');
    
    // Skip header row if it exists
    const startRow = lines[0] && lines[0].toLowerCase().includes('actionidentifier') ? 1 : 0;
    
    for (let i = startRow; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const parts = line.split(',');
        if (parts.length < 3) {
            console.warn(`Invalid CSV line format: ${line}`);
            continue;
        }
        
        const actionIdentifier = parts[0].trim();
        const completionsStr = parts[1].trim();
        const timeCompletedStr = parts[2].trim();
        
        if (!actionIdentifier) {
            console.warn(`Missing action identifier in line: ${line}`);
            continue;
        }
        
        // Parse learning data - actions have either completions OR timeCompleted
        const hasCompletions = completionsStr && !isNaN(parseInt(completionsStr));
        const hasTimeCompleted = timeCompletedStr && !isNaN(parseInt(timeCompletedStr));
        
        if (hasCompletions) {
            learningData[actionIdentifier] = {
                type: 'completions',
                value: parseInt(completionsStr)
            };
        } else if (hasTimeCompleted) {
            learningData[actionIdentifier] = {
                type: 'timeCompleted',
                value: parseInt(timeCompletedStr)
            };
        } else {
            // Neither column has valid data - default to 0 completions
            learningData[actionIdentifier] = {
                type: 'completions',
                value: 0
            };
        }
    }
    
    console.log(`Parsed learning data for ${Object.keys(learningData).length} actions`);
    return learningData;
}

/**
 * Exports learning data to CSV format
 * @param {Object} learningData - Learning data object
 * @returns {string} CSV content
 */
export function exportLearningCSV(learningData) {
    let csvContent = 'actionIdentifier,completions,timeCompleted\n';
    
    for (const [actionIdentifier, data] of Object.entries(learningData)) {
        const completions = data.type === 'completions' ? data.value : '';
        const timeCompleted = data.type === 'timeCompleted' ? data.value : '';
        csvContent += `${actionIdentifier},${completions},${timeCompleted}\n`;
    }
    
    return csvContent;
}

/**
 * Creates a learning data object for an action with given completions
 * @param {number} completions - Number of completions
 * @returns {Object} Learning data entry
 */
export function createCompletionEntry(completions) {
    return {
        type: 'completions',
        value: Math.max(0, Math.floor(completions))
    };
}

/**
 * Creates a learning data object for an action with partial completion time
 * @param {number} timeCompleted - Seconds of partial completion
 * @returns {Object} Learning data entry
 */
export function createTimeCompletedEntry(timeCompleted) {
    return {
        type: 'timeCompleted',
        value: Math.max(0, Math.floor(timeCompleted))
    };
}