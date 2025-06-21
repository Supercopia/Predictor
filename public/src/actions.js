// actions.js - Game Actions
export let actions = {};
export let actionsLoaded = false;

// List of possible paths to try for actions.json
const actionPaths = [
    '/data/actions.json',
    '../data/actions.json',
    './data/actions.json',
    '/api/actions'
];

// Function to load actions with multiple retry paths
async function loadActions() {
    console.log('Attempting to load actions...');
    let loaded = false;
    let lastError = null;
    
    // Try each path in sequence until successful
    for (const path of actionPaths) {
        if (loaded) break;
        
        try {
            console.log(`Attempting to load actions from: ${path}`);
            
            // Add cache-busting parameter
            const fetchPath = path + (path.includes('?') ? '&' : '?') + '_t=' + Date.now();
            const response = await fetch(fetchPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && Object.keys(data).length > 0) {
                console.log(`Actions loaded successfully from ${path}:`, Object.keys(data));
                actions = data;
                loaded = true;
            } else {
                console.warn(`Received empty data from ${path}`);
            }
        } catch (error) {
            console.warn(`Failed to load actions from ${path}:`, error);
            lastError = error;
        }
    }
    
    // Final status update
    if (loaded) {
        console.log('Actions successfully loaded:', Object.keys(actions));
    } else {
        console.error('Failed to load actions from all sources:', lastError);
        // Load fallback actions for testing if everything failed
        actions = {
            "Explore": { "time": 10, "location": "Camp" },
            "Rest": { "time": 5, "location": "Camp" },
            "Gather": { "time": 15, "location": "Camp", "inventory": {"Water Bottle": 1} }
        };
        console.warn('Using fallback actions for testing:', actions);
    }
    
    // Always set to true to prevent infinite waiting
    actionsLoaded = true;
}

// Start loading actions
loadActions();

