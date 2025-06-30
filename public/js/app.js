// Import game engine and learning system with error handling
let evaluateActionList;
let parseLearningCSV, initializeLearningState;
let AreaResources, Events;

// Try different relative paths to handle various browser environments
const importPaths = [
    '../src/predictor_engine.js',
    '/src/predictor_engine.js',
    './src/predictor_engine.js'
];

// Function to attempt imports from different paths
async function loadDependencies() {
    let engineLoaded = false;
    let learningLoaded = false;
    let lastError = null;
    
    // Load predictor engine
    for (const path of importPaths) {
        try {
            console.log(`Attempting to import predictor engine from: ${path}`);
            const module = await import(path + '?v=' + Date.now());
            evaluateActionList = module.evaluateActionList;
            console.log('Successfully loaded predictor engine');
            engineLoaded = true;
            break;
        } catch (error) {
            console.warn(`Failed to import engine from ${path}:`, error);
            lastError = error;
        }
    }
    
    // Load learning system modules
    const learningPaths = [
        '../src/csv_parser.js',
        '/src/csv_parser.js',
        './src/csv_parser.js'
    ];
    
    for (const path of learningPaths) {
        try {
            console.log(`Attempting to import CSV parser from: ${path}`);
            const csvModule = await import(path + '?v=' + Date.now());
            parseLearningCSV = csvModule.parseLearningCSV;
            
            const familiarityPath = path.replace('csv_parser.js', 'familiarity.js');
            console.log(`Attempting to import familiarity system from: ${familiarityPath}`);
            const familiarityModule = await import(familiarityPath + '?v=' + Date.now());
            initializeLearningState = familiarityModule.initializeLearningState;
            
            console.log('Successfully loaded learning system');
            learningLoaded = true;
            break;
        } catch (error) {
            console.warn(`Failed to import learning modules from ${path}:`, error);
            lastError = error;
        }
    }
    
    if (!engineLoaded) {
        console.error('Failed to load predictor engine after multiple attempts:', lastError);
        showError('Failed to load predictor engine. Please check console for details.');
    }
    
    if (!learningLoaded) {
        console.error('Failed to load learning system after multiple attempts:', lastError);
        showError('Failed to load learning system. Please check console for details.');
    }
    
    // Load area resources and events modules
    let areaResourcesLoaded = false;
    const areaResourcesPaths = [
        '../src/area_resources.js',
        '/src/area_resources.js',
        './src/area_resources.js'
    ];
    
    for (const path of areaResourcesPaths) {
        try {
            console.log(`Attempting to import area resources from: ${path}`);
            const areaModule = await import(path + '?v=' + Date.now());
            AreaResources = areaModule.AreaResources;
            
            const eventsPath = path.replace('area_resources.js', 'events.js');
            console.log(`Attempting to import events from: ${eventsPath}`);
            const eventsModule = await import(eventsPath + '?v=' + Date.now());
            Events = eventsModule.Events;
            
            console.log('Successfully loaded area resources and events system');
            areaResourcesLoaded = true;
            break;
        } catch (error) {
            console.warn(`Failed to import area modules from ${path}:`, error);
            lastError = error;
        }
    }
    
    if (!areaResourcesLoaded) {
        console.error('Failed to load area resources and events system after multiple attempts:', lastError);
        showError('Failed to load area resources system. Please check console for details.');
    }
}

// Track initialization state
let isInitializing = false;
let isInitialized = false;

// Proper initialization sequence
function initializeApp() {
    // Prevent multiple initializations
    if (isInitialized || isInitializing) {
        console.log('App initialization already in progress or completed');
        return;
    }
    
    isInitializing = true;
    console.log('Starting app initialization...');
    
    // Only proceed if the DOM is fully loaded
    if (document.readyState === 'loading') {
        console.log('DOM not ready, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    console.log('DOM ready, loading dependencies...');
    
    // Now load dependencies with timeout
    const initTimeout = setTimeout(() => {
        if (!isInitialized) {
            console.warn('Initialization is taking too long, trying to recover...');
            showError('Application is taking longer than expected to load. Please wait or refresh the page.');
        }
    }, 10000); // 10 second timeout
    
    loadDependencies()
        .then(() => {
            console.log('Dependencies loaded, initializing app...');
            return init();
        })
        .then(() => {
            clearTimeout(initTimeout);
            isInitialized = true;
            isInitializing = false;
            console.log('App initialization complete');
        })
        .catch(error => {
            clearTimeout(initTimeout);
            isInitializing = false;
            console.error('Critical error during initialization:', error);
            showError('Failed to load application. ' + 
                     (error.message || 'Please refresh the page or clear browser cache.'));
        });
}

// Start initialization
initializeApp();

// Utility functions
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    
    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 5000);
}

function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'success-message';
    successEl.textContent = message;
    
    // Add inline styling to ensure visibility
    successEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    
    document.body.appendChild(successEl);
    setTimeout(() => successEl.remove(), 3000);
}

// Handle CSV file import for learning data
async function handleLearningCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showError('Please select a CSV file');
        return;
    }
    
    try {
        // Read file content
        const fileContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
        
        // Parse CSV data
        if (!parseLearningCSV) {
            showError('Learning system not loaded yet. Please try again.');
            return;
        }
        
        const csvLearningData = parseLearningCSV(fileContent);
        
        // Initialize learning state
        if (!initializeLearningState || !actions) {
            showError('Required modules not loaded yet. Please try again.');
            return;
        }
        
        learningState = initializeLearningState(csvLearningData, actions);
        
        // Count loaded actions
        const actionCount = Object.keys(csvLearningData).length;
        const completionCount = Object.values(csvLearningData)
            .filter(data => data.type === 'completions' && data.value > 0).length;
        const partialCount = Object.values(csvLearningData)
            .filter(data => data.type === 'timeCompleted' && data.value > 0).length;
        
        showSuccess(`Learning data loaded: ${actionCount} actions (${completionCount} completed, ${partialCount} partial)`);
        
        // Clear file input for next import
        event.target.value = '';
        
    } catch (error) {
        console.error('Error importing learning CSV:', error);
        showError(`Failed to import learning data: ${error.message}`);
        event.target.value = '';
    }
}

// DOM Elements
const availableActionsEl = document.getElementById('available-actions');
const timelineEl = document.getElementById('timeline');
const actionSearchEl = document.getElementById('action-search');
const runSimulationBtn = document.getElementById('run-simulation');
const clearTimelineBtn = document.getElementById('clear-timeline');
const toggleGraphBtn = document.getElementById('toggle-graph');
const importLearningBtn = document.getElementById('import-learning');
const csvFileInput = document.getElementById('csv-file-input');
const totalTimeEl = document.getElementById('total-time');
const inventoryEl = document.getElementById('inventory');
const currentLocationEl = document.getElementById('current-location');
const locationSelectEl = document.getElementById('location-select');
const vitalsGraphEl = document.getElementById('vitals-graph');
const currentTimeIndicatorEl = document.getElementById('current-time-indicator');

// Graph elements (SVG-based)
let vitalsChartEl = null;
let tooltipDot = null;
let tooltipBg = null;
let tooltipText = null;

// Game state
let gameState = {
    air: 10,
    water: 10,
    food: 10,
    airCapacity: 10,
    waterCapacity: 10,
    foodCapacity: 10,
    inventory: {},
    location: "Camp",
    timeElapsed: 0,
    loopFailed: false,
    failureReason: null
};

let timeline = [];
let actions = [];
let locations = [];
let simulationHistory = [];
let isGraphVisible = false;
let learningState = {}; // Current learning state for simulation

// Initialize with some test learning data for demonstration
function initializeTestLearningData() {
    learningState = {
        "Travel to Laurion": { type: 'completions', value: 2 }, // 1.2x speed (fast: 1.0 + 2×0.1)
        "Cross Desert": { type: 'completions', value: 5 }, // 1.5x speed (fast: 1.0 + 5×0.1)  
        "Take Food Ration": { type: 'completions', value: 10 } // 1.19x speed (slow: 1.1 + 9×0.01)
    };
    console.log('Test learning data initialized:', learningState);
    
    // Add a small delay to ensure DOM is ready for the success message
    setTimeout(() => {
        showSuccess('Test learning data loaded: ' + Object.keys(learningState).length + ' actions');
    }, 100);
}

// Vitals graph configuration
const vitalsGraphConfig = {
    yAxisInterval: 5, // Y-axis grid interval (customizable)
    chartType: 'connected' // 'connected' or 'step' (for future implementation)
};

// Initialize the application
async function init() {
    try {
        // Load actions and locations
        await Promise.all([
            loadActions(),
            loadLocations()
        ]);
        
        // Then set up the UI
        renderAvailableActions();
        setupEventListeners();
        setupActionDetailsModal();
        updateGameStateDisplay();
        populateLocationSelector();
        
        // Initialize test learning data for demonstration
        initializeTestLearningData();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to initialize application. Please check the console for details.');
    }
}

// Track loading states
const loadingState = {
    actions: {
        isLoading: false,
        lastAttempt: 0,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 2000 // 2 seconds
    }
};

// Load actions from the server with retry logic
async function loadActions() {
    const state = loadingState.actions;
    
    // Prevent multiple simultaneous requests
    if (state.isLoading) {
        console.log('Actions load already in progress');
        return [];
    }
    
    // Check if we should retry or wait
    const now = Date.now();
    if (now - state.lastAttempt < state.retryDelay) {
        console.log('Waiting before retrying actions load');
        return [];
    }
    
    state.isLoading = true;
    state.lastAttempt = now;
    
    try {
        console.log('Loading actions...');
        const response = await fetch('/api/actions');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate response
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid actions data received');
        }
        
        // Convert actions to array format
        actions = Object.entries(data).map(([name, details]) => ({
            name,
            ...(details || {}),
            // Convert location to locationRequirement for compatibility
            ...(details?.location && !details?.locationRequirement 
                ? { locationRequirement: details.location } 
                : {})
        }));
        
        console.log(`Loaded ${actions.length} actions`);
        state.retryCount = 0; // Reset retry counter on success
        return actions;
        
    } catch (error) {
        state.retryCount++;
        console.error(`Failed to load actions (attempt ${state.retryCount}/${state.maxRetries}):`, error);
        
        if (state.retryCount < state.maxRetries) {
            console.log(`Retrying in ${state.retryDelay}ms...`);
            setTimeout(loadActions, state.retryDelay);
        } else {
            showError('Failed to load actions. Using limited functionality.');
            // Provide minimal fallback actions
            actions = [
                { name: 'Rest', time: 5, location: 'Camp' },
                { name: 'Explore', time: 10, location: 'Camp' }
            ];
        }
        
        return [];
    } finally {
        state.isLoading = false;
    }
}

// Initialize locations loading state
loadingState.locations = {
    isLoading: false,
    lastAttempt: 0,
    retryCount: 0,
    maxRetries: 2,
    retryDelay: 2000 // 2 seconds
};

// Load locations from the server with retry logic
async function loadLocations() {
    const state = loadingState.locations;
    
    // Prevent multiple simultaneous requests
    if (state.isLoading) {
        console.log('Locations load already in progress');
        return [];
    }
    
    // Check if we should retry or wait
    const now = Date.now();
    if (now - state.lastAttempt < state.retryDelay) {
        console.log('Waiting before retrying locations load');
        return [];
    }
    
    state.isLoading = true;
    state.lastAttempt = now;
    
    try {
        console.log('Loading locations...');
        const response = await fetch('/data/locations.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate response - check for locations array in object
        if (data && Array.isArray(data.locations)) {
            locations = data.locations;
        } else if (Array.isArray(data)) {
            locations = data;
        } else {
            throw new Error('Invalid locations data received');
        }
        console.log(`Loaded ${locations.length} locations`);
        state.retryCount = 0; // Reset retry counter on success
        return locations;
        
    } catch (error) {
        state.retryCount++;
        console.error(`Failed to load locations (attempt ${state.retryCount}/${state.maxRetries}):`, error);
        
        if (state.retryCount < state.maxRetries) {
            console.log(`Retrying in ${state.retryDelay}ms...`);
            setTimeout(loadLocations, state.retryDelay);
        } else {
            console.warn('Using default locations after max retries');
            // Provide default location
            locations = [{ name: 'Camp', description: 'Your starting location' }];
        }
        
        return locations || [];
    } finally {
        state.isLoading = false;
    }
}

// Populate location selector dropdown
function populateLocationSelector() {
    // Clear existing options first (keep the first default option)
    while (locationSelectEl.options.length > 1) {
        locationSelectEl.remove(1);
    }
    
    // Add options for each location
    Object.keys(locations).forEach(location => {
        if (location !== 'Camp') { // Skip Camp as it's already the default
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelectEl.appendChild(option);
        }
    });
}

// Render available actions in the left panel
function renderAvailableActions(filter = '') {
    availableActionsEl.innerHTML = '';
    
    const filteredActions = filter 
        ? actions.filter(action => 
            action.name.toLowerCase().includes(filter.toLowerCase()))
        : actions;
    
    if (filteredActions.length === 0) {
        availableActionsEl.innerHTML = '<div class="empty">No actions found</div>';
        return;
    }
    
    filteredActions.forEach(action => {
        const actionEl = document.createElement('div');
        actionEl.className = 'action-item';
        actionEl.draggable = true;
        actionEl.dataset.action = JSON.stringify(action);
        
        actionEl.innerHTML = `
            <div class="action-header">
                <h4>${action.name}</h4>
                <button class="view-action-details" data-action="${action.name}" title="View action details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
            <div class="action-meta">
                <span>Time: ${action.time || 1}s</span>
                ${action.locationRequirement ? `<span>From: ${action.locationRequirement}</span>` : ''}
                ${action.location ? `<span>→ To: ${action.location}</span>` : ''}
            </div>
        `;
        
        // Add drag event listeners
        actionEl.addEventListener('dragstart', handleDragStart);
        actionEl.addEventListener('dragend', handleDragEnd);

        // Add click listener for the view button
        const viewButton = actionEl.querySelector('.view-action-details');
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering drag events
            showActionDetailsModal(action.name);
        });

        availableActionsEl.appendChild(actionEl);
    });
}

// Render the timeline
function renderTimeline() {
    timelineEl.innerHTML = '';
    
    if (timeline.length === 0) {
        timelineEl.innerHTML = '<div class="empty-state">Drag actions here to build your timeline</div>';
        totalTimeEl.textContent = '0s';
        return;
    }
    
    let totalTime = 0;
    
    timeline.forEach((action, index) => {
        // Ensure action has count property
        if (action.count === undefined) {
            action.count = 1;
        }
        
        // Calculate time accounting for count (skip if count is 0)
        const actionTime = (action.time || 1) * action.count;
        if (action.count > 0) {
            totalTime += actionTime;
        }
        
        const actionEl = document.createElement('div');
        actionEl.className = 'timeline-item';
        actionEl.draggable = true;
        actionEl.dataset.index = index;
        
        // Add disabled class if count is 0
        if (action.count === 0) {
            actionEl.classList.add('disabled');
        }
        
        actionEl.innerHTML = `
            <div class="action-content">
                <div class="action-name">${action.name} x${action.count}</div>
                <div class="action-time">Time: ${actionTime}s</div>
                ${action.locationRequirement ? `<div class="action-location-req">Requires: ${action.locationRequirement}</div>` : ''}
                ${action.location ? `<div class="action-location">→ Goes to: ${action.location}</div>` : ''}
            </div>
            <div class="action-controls">
                <button class="decrease-count" data-index="${index}">−</button>
                <button class="increase-count" data-index="${index}">+</button>
                <button class="remove-action" data-index="${index}">&times;</button>
            </div>
        `;
        
        // Add drag event listeners
        actionEl.addEventListener('dragstart', handleDragStart);
        actionEl.addEventListener('dragend', handleDragEnd);
        actionEl.addEventListener('dragover', handleDragOver);
        actionEl.addEventListener('drop', handleDrop);
        actionEl.addEventListener('dragenter', handleDragEnter);
        actionEl.addEventListener('dragleave', handleDragLeave);
        
        timelineEl.appendChild(actionEl);
    });
    
    totalTimeEl.textContent = `${totalTime}s`;
}

// Update the game state display
function updateGameStateDisplay() {
    // Update vitals (show current/capacity and percentage relative to capacity)
    document.querySelector('#air-display .vital-label span').textContent = `${Math.round(gameState.air)}/${gameState.airCapacity}`;
    document.querySelector('#water-display .vital-label span').textContent = `${Math.round(gameState.water)}/${gameState.waterCapacity}`;
    document.querySelector('#food-display .vital-label span').textContent = `${Math.round(gameState.food)}/${gameState.foodCapacity}`;
    
    document.querySelector('#air-display .vital-fill').style.width = `${(gameState.air / gameState.airCapacity) * 100}%`;
    document.querySelector('#water-display .vital-fill').style.width = `${(gameState.water / gameState.waterCapacity) * 100}%`;
    document.querySelector('#food-display .vital-fill').style.width = `${(gameState.food / gameState.foodCapacity) * 100}%`;
    
    // Update vital trends based on simulation history
    updateVitalTrends();
    
    // Update inventory with enhanced display
    inventoryEl.innerHTML = '';
    const inventory = gameState.inventory;
    
    if (Object.keys(inventory).length === 0) {
        inventoryEl.innerHTML = '<div class="empty">Empty</div>';
    } else {
        Object.entries(inventory).forEach(([item, quantity]) => {
            if (quantity > 0) {
                const itemEl = document.createElement('div');
                itemEl.className = 'inventory-item';
                itemEl.innerHTML = `
                    <div class="inventory-icon">📦</div>
                    <div class="inventory-name">${item}</div>
                    <div class="inventory-quantity">x${quantity}</div>
                `;
                inventoryEl.appendChild(itemEl);
            }
        });
    }
    
    // Update location
    currentLocationEl.textContent = gameState.location;
    
    // Update location selector to match current location
    locationSelectEl.value = gameState.location;
    
    // Don't update total time here - it's managed by renderTimeline()
    
    // If the loop failed, show the reason
    if (gameState.loopFailed) {
        showError(`Loop failed: ${gameState.failureReason}`);
    }
    
    // Update vital graphs if they are visible
    if (isGraphVisible) {
        updateVitalsGraph();
    }
    
    // Update area resources display
    updateAreaResourcesDisplay();
}

// Update vital trends based on simulation history
function updateVitalTrends() {
    const airTrendEl = document.querySelector('#air-display .vital-trend');
    const waterTrendEl = document.querySelector('#water-display .vital-trend');
    const foodTrendEl = document.querySelector('#food-display .vital-trend');

    // Default to neutral if we don't have enough history
    if (simulationHistory.length < 2) {
        airTrendEl.className = 'vital-trend trend-neutral';
        airTrendEl.textContent = '−';
        waterTrendEl.className = 'vital-trend trend-neutral';
        waterTrendEl.textContent = '−';
        foodTrendEl.className = 'vital-trend trend-neutral';
        foodTrendEl.textContent = '−';
        return;
    }

    // Get the two most recent entries
    const current = simulationHistory[simulationHistory.length - 1];
    const previous = simulationHistory[simulationHistory.length - 2];

    // Air trend
    if (current.air > previous.air) {
        airTrendEl.className = 'vital-trend trend-up';
        airTrendEl.textContent = '↑';
    } else if (current.air < previous.air) {
        airTrendEl.className = 'vital-trend trend-down';
        airTrendEl.textContent = '↓';
    } else {
        airTrendEl.className = 'vital-trend trend-neutral';
        airTrendEl.textContent = '−';
    }

    // Water trend
    if (current.water > previous.water) {
        waterTrendEl.className = 'vital-trend trend-up';
        waterTrendEl.textContent = '↑';
    } else if (current.water < previous.water) {
        waterTrendEl.className = 'vital-trend trend-down';
        waterTrendEl.textContent = '↓';
    } else {
        waterTrendEl.className = 'vital-trend trend-neutral';
        waterTrendEl.textContent = '−';
    }

    // Food trend
    if (current.food > previous.food) {
        foodTrendEl.className = 'vital-trend trend-up';
        foodTrendEl.textContent = '↑';
    } else if (current.food < previous.food) {
        foodTrendEl.className = 'vital-trend trend-down';
        foodTrendEl.textContent = '↓';
    } else {
        foodTrendEl.className = 'vital-trend trend-neutral';
        foodTrendEl.textContent = '−';
    }
}

// Update area resources display
function updateAreaResourcesDisplay() {
    const areaResourcesEl = document.getElementById('area-resources');
    
    // Get latest area resources data from simulation history
    if (simulationHistory.length === 0) {
        areaResourcesEl.innerHTML = '<div class="empty">No area resources available</div>';
        return;
    }
    
    const latestEntry = simulationHistory[simulationHistory.length - 1];
    console.log('Latest simulation entry:', latestEntry);
    const areaResources = latestEntry.areaResources;
    console.log('Area resources from simulation:', areaResources);
    
    if (!areaResources || Object.keys(areaResources).length === 0) {
        console.log('No area resources found in simulation data');
        areaResourcesEl.innerHTML = '<div class="empty">No area resources available</div>';
        return;
    }
    
    areaResourcesEl.innerHTML = '';
    
    // Display area resources by location
    Object.entries(areaResources).forEach(([location, resources]) => {
        if (Object.keys(resources).length === 0) return;
        
        const locationEl = document.createElement('div');
        locationEl.className = 'area-location';
        locationEl.innerHTML = `<h4>${location}</h4>`;
        
        Object.entries(resources).forEach(([resourceType, data]) => {
            const resourceEl = document.createElement('div');
            resourceEl.className = 'area-resource';
            
            const currentValue = data.current === -1 ? '∞' : Math.round(data.current * 10) / 10;
            const initialValue = data.initial === -1 ? '∞' : data.initial;
            const generation = data.generation > 0 ? ` (+${data.generation}/s)` : '';
            
            resourceEl.innerHTML = `
                <div class="resource-name">${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}:</div>
                <div class="resource-value">${currentValue}/${initialValue}${generation}</div>
            `;
            
            locationEl.appendChild(resourceEl);
        });
        
        areaResourcesEl.appendChild(locationEl);
    });
}

// Update vitals graph based on simulation history
function updateVitalsGraph() {
    try {
        const svg = document.getElementById('vitals-chart');
        if (!svg || simulationHistory.length === 0) return;

        // Get SVG dimensions
        const rect = svg.getBoundingClientRect();
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = rect.width - margin.left - margin.right;
        const height = rect.height - margin.top - margin.bottom;

        // Clear existing content
        const yAxis = document.getElementById('y-axis');
        const xAxis = document.getElementById('x-axis');
        const vitalLines = document.getElementById('vital-lines');
        
        yAxis.innerHTML = '';
        xAxis.innerHTML = '';
        vitalLines.innerHTML = '';

        // Calculate scales - always use actual time elapsed for full width utilization
        const maxTime = gameState.timeElapsed;
        const maxVital = Math.max(...simulationHistory.map(d => Math.max(d.airCapacity, d.waterCapacity, d.foodCapacity))); // Use capacity maximums
        const actualMin = Math.min(...simulationHistory.map(d => Math.min(d.air, d.water, d.food)));
        const yStep = vitalsGraphConfig.yAxisInterval; // Configurable step size
        const minVital = Math.min(0, Math.floor(actualMin / yStep) * yStep); // Rounded minimum, always includes 0

        // Create Y-axis (vitals scale)
        const yScale = (value) => margin.top + (maxVital - value) * (height / (maxVital - minVital));
        const xScale = (time) => margin.left + (time / maxTime) * width;

        // Draw Y-axis grid lines and labels
        // yStep already declared above (configurable)
        const ySteps = Math.ceil(maxVital / yStep);
        for (let i = 0; i <= ySteps; i++) {
            const value = i * yStep;
            if (value > maxVital) break;
            
            const y = yScale(value);
            
            // Grid line
            const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            gridLine.setAttribute('x1', margin.left);
            gridLine.setAttribute('y1', y);
            gridLine.setAttribute('x2', margin.left + width);
            gridLine.setAttribute('y2', y);
            gridLine.setAttribute('class', 'grid-line');
            yAxis.appendChild(gridLine);

            // Y-axis label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', margin.left - 5);
            label.setAttribute('y', y + 3);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'axis-text');
            label.textContent = value.toString();
            yAxis.appendChild(label);
        }
        
        // Add one more grid line at the top if needed
        if (ySteps * yStep < maxVital) {
            const y = yScale(maxVital);
            const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            gridLine.setAttribute('x1', margin.left);
            gridLine.setAttribute('y1', y);
            gridLine.setAttribute('x2', margin.left + width);
            gridLine.setAttribute('y2', y);
            gridLine.setAttribute('class', 'grid-line');
            yAxis.appendChild(gridLine);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', margin.left - 5);
            label.setAttribute('y', y + 3);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'axis-text');
            label.textContent = Math.ceil(maxVital).toString();
            yAxis.appendChild(label);
        }

        // Draw X-axis grid lines and labels
        // Choose appropriate time interval based on total duration
        let timeInterval = 300; // Default 5 minutes
        if (maxTime <= 120) timeInterval = 30; // 30 seconds for very short cycles
        else if (maxTime <= 600) timeInterval = 60; // 1 minute for short cycles
        else if (maxTime <= 1800) timeInterval = 300; // 5 minutes for medium cycles
        else timeInterval = 600; // 10 minutes for long cycles
        
        const timeSteps = Math.ceil(maxTime / timeInterval);
        for (let i = 0; i <= timeSteps; i++) {
            const time = (i * timeInterval);
            if (time > maxTime) break;
            
            const x = xScale(time);
            
            // Grid line
            const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            gridLine.setAttribute('x1', x);
            gridLine.setAttribute('y1', margin.top);
            gridLine.setAttribute('x2', x);
            gridLine.setAttribute('y2', margin.top + height);
            gridLine.setAttribute('class', 'grid-line');
            xAxis.appendChild(gridLine);

            // X-axis label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', margin.top + height + 15);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('class', 'axis-text');
            
            // Format time label appropriately
            if (timeInterval < 60) {
                label.textContent = `${time}s`;
            } else {
                label.textContent = `${Math.floor(time / 60)}m`;
            }
            xAxis.appendChild(label);
        }
        
        // Always add a final grid line and label at the end
        if (timeSteps * timeInterval < maxTime) {
            const x = xScale(maxTime);
            const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            gridLine.setAttribute('x1', x);
            gridLine.setAttribute('y1', margin.top);
            gridLine.setAttribute('x2', x);
            gridLine.setAttribute('y2', margin.top + height);
            gridLine.setAttribute('class', 'grid-line');
            xAxis.appendChild(gridLine);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', margin.top + height + 15);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('class', 'axis-text');
            
            if (maxTime < 60) {
                label.textContent = `${maxTime}s`;
            } else {
                label.textContent = `${Math.floor(maxTime / 60)}m`;
            }
            xAxis.appendChild(label);
        }

        // Create line paths for each vital
        const vitals = ['air', 'water', 'food'];
        const vitalClasses = ['air-line', 'water-line', 'food-line'];

        vitals.forEach((vital, index) => {
            const pathData = simulationHistory.map((point, i) => {
                const x = xScale(point.timeElapsed);
                const y = yScale(point[vital]);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', vitalClasses[index]);
            vitalLines.appendChild(path);
        });

        // Set up mouse interaction for tooltip
        setupVitalsTooltip(svg, xScale, yScale, margin, width, height, maxTime);

    } catch (error) {
        console.error('Error in updateVitalsGraph:', error);
    }
}

// Set up tooltip functionality for the vitals graph
function setupVitalsTooltip(svg, xScale, yScale, margin, width, height, maxTime) {
    const tooltipDot = document.getElementById('tooltip-dot');
    const tooltipBg = document.getElementById('tooltip-bg');
    const tooltipText = document.getElementById('tooltip-text');

    // Create invisible overlay for mouse tracking
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    overlay.setAttribute('x', margin.left);
    overlay.setAttribute('y', margin.top);
    overlay.setAttribute('width', width);
    overlay.setAttribute('height', height);
    overlay.setAttribute('fill', 'transparent');
    overlay.setAttribute('pointer-events', 'all');

    overlay.addEventListener('mousemove', (event) => {
        const rect = svg.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const time = (mouseX - margin.left) / width * maxTime;
        
        // Find closest simulation point
        const closestPoint = simulationHistory.reduce((prev, curr) => {
            return Math.abs(curr.timeElapsed - time) < Math.abs(prev.timeElapsed - time) ? curr : prev;
        });

        if (closestPoint) {
            // Position tooltip dot
            const dotX = xScale(closestPoint.timeElapsed);
            const dotY = yScale(closestPoint.air); // Use air as reference point
            tooltipDot.setAttribute('cx', dotX);
            tooltipDot.setAttribute('cy', dotY);
            tooltipDot.style.display = 'block';

            // Create tooltip content
            const tooltipContent = [
                `Time: ${Math.floor(closestPoint.timeElapsed / 60)}m ${closestPoint.timeElapsed % 60}s`,
                `Air: ${closestPoint.air.toFixed(1)}`,
                `Water: ${closestPoint.water.toFixed(1)}`,
                `Food: ${closestPoint.food.toFixed(1)}`,
                `Location: ${closestPoint.location || 'Unknown'}`
            ];

            // Add inventory if present
            if (closestPoint.inventory && Object.keys(closestPoint.inventory).length > 0) {
                tooltipContent.push('Inventory:');
                Object.entries(closestPoint.inventory).forEach(([item, count]) => {
                    tooltipContent.push(`  ${item}: ${count}`);
                });
            }

            // Position and size tooltip
            const textLines = tooltipContent.length;
            const lineHeight = 14;
            const padding = 8;
            const tooltipWidth = Math.max(...tooltipContent.map(line => line.length * 6.5)) + padding * 2;
            const tooltipHeight = textLines * lineHeight + padding * 2;

            let tooltipX = dotX + 10;
            let tooltipY = dotY - tooltipHeight / 2;

            // Keep tooltip in bounds
            if (tooltipX + tooltipWidth > margin.left + width) {
                tooltipX = dotX - tooltipWidth - 10;
            }
            if (tooltipY < margin.top) {
                tooltipY = margin.top;
            }
            if (tooltipY + tooltipHeight > margin.top + height) {
                tooltipY = margin.top + height - tooltipHeight;
            }

            // Update tooltip elements
            tooltipBg.setAttribute('x', tooltipX);
            tooltipBg.setAttribute('y', tooltipY);
            tooltipBg.setAttribute('width', tooltipWidth);
            tooltipBg.setAttribute('height', tooltipHeight);
            tooltipBg.style.display = 'block';

            // Clear and add text lines
            tooltipText.innerHTML = '';
            tooltipContent.forEach((line, i) => {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', tooltipX + padding);
                tspan.setAttribute('y', tooltipY + padding + (i + 1) * lineHeight);
                tspan.textContent = line;
                tooltipText.appendChild(tspan);
            });
            tooltipText.style.display = 'block';
        }
    });

    overlay.addEventListener('mouseleave', () => {
        tooltipDot.style.display = 'none';
        tooltipBg.style.display = 'none';
        tooltipText.style.display = 'none';
    });

    svg.appendChild(overlay);
}

// Toggle vitals graph visibility
function toggleVitalsGraph() {
    // Check if required elements are available
    if (!vitalsGraphEl) {
        vitalsGraphEl = document.getElementById('vitals-graph');
        if (!vitalsGraphEl) {
            console.error('Cannot find vitals-graph element');
            return;
        }
    }
    
    if (!toggleGraphBtn) {
        toggleGraphBtn = document.getElementById('toggle-graph');
        if (!toggleGraphBtn) {
            console.error('Cannot find toggle-graph button');
            return;
        }
    }
    
    isGraphVisible = !isGraphVisible;
    
    try {
        if (isGraphVisible) {
            // Show the graph
            vitalsGraphEl.style.display = 'block';
            
            // Update the graph content
            if (simulationHistory.length === 0) {
                // Clear SVG and show empty state
                const svg = document.getElementById('vitals-chart');
                if (svg) {
                    const yAxis = document.getElementById('y-axis');
                    const xAxis = document.getElementById('x-axis');
                    const vitalLines = document.getElementById('vital-lines');
                    
                    if (yAxis) yAxis.innerHTML = '';
                    if (xAxis) xAxis.innerHTML = '';
                    if (vitalLines) vitalLines.innerHTML = '';
                    
                    // Add empty state text
                    const emptyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    emptyText.setAttribute('x', '50%');
                    emptyText.setAttribute('y', '50%');
                    emptyText.setAttribute('text-anchor', 'middle');
                    emptyText.setAttribute('dominant-baseline', 'middle');
                    emptyText.setAttribute('fill', 'var(--text-secondary)');
                    emptyText.setAttribute('font-size', '14');
                    emptyText.textContent = 'Run a simulation to see vitals data';
                    svg.appendChild(emptyText);
                }
            } else {
                updateVitalsGraph();
            }
        } else {
            vitalsGraphEl.style.display = 'none';
        }
        toggleGraphBtn.textContent = isGraphVisible ? 'Hide Vitals Graph' : 'Show Vitals Graph';
    } catch (error) {
        console.error('Error in toggleVitalsGraph:', error);
    }
}

// Run the simulation
async function runSimulation() {
    // Clone timeline for evaluation
    const timelineActions = [...timeline];
    
    if (timelineActions.length === 0) {
        showError('Cannot run simulation: Timeline is empty');
        return;
    }
    
    try {
        // Reset the game state before running
        resetGameState();
        
        // Clear simulation history
        simulationHistory = [];
        
        // Add initial state to history
        simulationHistory.push({...gameState});
        
        // Make sure evaluateActionList is available
        if (!evaluateActionList) {
            throw new Error('Predictor engine not loaded yet. Please try again in a moment.');
        }
        
        // Expand repeated actions and extract action names
        const actionNames = [];
        timelineActions.forEach(action => {
            const count = action.count || 1;
            const actionName = typeof action === 'string' ? action : action.name;
            
            // Skip actions with count 0
            if (count > 0) {
                // Add the action multiple times based on count
                for (let i = 0; i < count; i++) {
                    actionNames.push(actionName);
                }
            }
        });
        
        // Run the simulation using the engine with action names and learning state
        console.log('Running simulation with learning state:', learningState);
        console.log('Actions to simulate:', actionNames);
        const result = await evaluateActionList(actionNames, learningState);
        
        // Log learning effects for comparison
        if (result.timeline && result.timeline.length > 0) {
            result.timeline.forEach((step, index) => {
                if (step.actionDuration !== undefined && step.baseDuration !== undefined) {
                    const speedup = step.baseDuration / step.actionDuration;
                    console.log(`Action ${index + 1}: "${step.action}" - Base: ${step.baseDuration}s, Actual: ${step.actionDuration.toFixed(2)}s (${speedup.toFixed(2)}x speed)`);
                }
            });
        }
        
        if (!result || !result.timeline) {
            throw new Error('Invalid simulation result returned from engine');
        }
        
        // Add timeline states to our simulation history
        if (result.timeline && result.timeline.length > 0) {
            result.timeline.forEach(state => {
                simulationHistory.push({
                    air: state.vitals ? state.vitals.air : state.air,
                    water: state.vitals ? state.vitals.water : state.water,
                    food: state.vitals ? state.vitals.food : state.food,
                    airCapacity: state.capacities ? state.capacities.airCapacity : state.airCapacity,
                    waterCapacity: state.capacities ? state.capacities.waterCapacity : state.waterCapacity,
                    foodCapacity: state.capacities ? state.capacities.foodCapacity : state.foodCapacity,
                    inventory: state.inventory,
                    location: state.location,
                    timeElapsed: state.timeElapsed,
                    areaResources: state.areaResources,
                    events: state.events
                });
            });
        }
        
        // Get the final state from the simulation
        const finalState = result.timeline[result.timeline.length - 1];
        const summary = result.summary;
        
        // Update the game state with the result
        gameState = {
            air: summary.finalVitals.air,
            water: summary.finalVitals.water,
            food: summary.finalVitals.food,
            airCapacity: finalState.capacities ? finalState.capacities.airCapacity : gameState.airCapacity,
            waterCapacity: finalState.capacities ? finalState.capacities.waterCapacity : gameState.waterCapacity,
            foodCapacity: finalState.capacities ? finalState.capacities.foodCapacity : gameState.foodCapacity,
            inventory: summary.inventory || {},
            location: summary.location,
            timeElapsed: summary.timeElapsed,
            loopFailed: summary.loopFailed || false,
            failureReason: summary.failureReason || null
        };
        
        console.log('Simulation result:', result);
        console.log('Updated game state:', gameState);
        console.log('Simulation history:', simulationHistory);
        
        // Update the UI
        updateGameStateDisplay();
        
        // Show time indicator if we have simulation history
        if (simulationHistory.length > 0) {
            animateTimeIndicator();
        }
        
        if (!gameState.loopFailed) {
            showSuccess('Simulation completed successfully!');
        } else if (gameState.failureReason) {
            showError(`Loop failed: ${gameState.failureReason}`);
        }
    } catch (error) {
        console.error('Error running simulation:', error);
        showError(`Simulation error: ${error.message || 'Unknown error'}`);
    }
}

// Animate the time indicator along the timeline
function animateTimeIndicator() {
    // Only show if we have history and the indicator exists
    if (!currentTimeIndicatorEl || simulationHistory.length === 0) return;

    const maxTime = gameState.timeElapsed;
    const timelineWidth = timelineEl.offsetWidth;
    const timelineStart = timelineEl.getBoundingClientRect().left;

    // Hide indicator initially
    currentTimeIndicatorEl.style.display = 'none';

    // Clone history for animation
    const historyPoints = [...simulationHistory];
    let currentIndex = 0;

    // Start animation
    const animate = () => {
        if (currentIndex >= historyPoints.length) {
            // End of animation, hide indicator
            setTimeout(() => {
                currentTimeIndicatorEl.style.display = 'none';
            }, 1000);
            return;
        }

        const point = historyPoints[currentIndex];
        const position = (point.timeElapsed / maxTime) * 100;

        // Update indicator position
        currentTimeIndicatorEl.style.display = 'block';
        currentTimeIndicatorEl.style.left = `${position}%`;
        currentTimeIndicatorEl.querySelector('.current-time-label').textContent = `${point.timeElapsed}s`;

        // Move to next point after delay
        currentIndex++;
        setTimeout(animate, 300); // Adjust speed as needed
    };

    // Start animation
    animate();
}

// Reset the game state to initial values
function resetGameState() {
    gameState = {
        air: 10,
        water: 10,
        food: 10,
        airCapacity: 10,
        waterCapacity: 10,
        foodCapacity: 10,
        inventory: {},
        location: locationSelectEl.value || "Camp", // Use selected location
        timeElapsed: 0,
        loopFailed: false,
        failureReason: null
    };

    // Clear simulation history
    simulationHistory = [];

    // Hide time indicator
    if (currentTimeIndicatorEl) {
        currentTimeIndicatorEl.style.display = 'none';
    }

    updateGameStateDisplay();
}
// Action Details Modal Functions
function setupActionDetailsModal() {
    const modal = document.getElementById('action-details-modal');
    const closeButton = modal.querySelector('.close-modal');
    
    // Close the modal when the close button is clicked
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close the modal when ESC key is pressed
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}

function showActionDetailsModal(actionName) {
    // Find the action with the given name
    const actionDef = actions.find(action => action.name === actionName);
    if (!actionDef) {
        showError(`Action '${actionName}' not found`);
        return;
    }
    
    // Get the modal elements
    const modal = document.getElementById('action-details-modal');
    const actionNameEl = document.getElementById('modal-action-name');
    const actionJsonEl = document.getElementById('modal-action-json');
    
    // Update the modal content
    actionNameEl.textContent = actionName;
    actionJsonEl.textContent = JSON.stringify(actionDef, null, 2);
    
    // Show the modal
    modal.style.display = 'block';
}

// Clear the timeline
function clearTimeline() {
    timeline = [];
    renderTimeline();
    resetGameState();
}

// Drag and Drop Handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('drop-zone'));
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    // Prevent default and stop propagation to avoid multiple triggers
    e.preventDefault();
    e.stopPropagation();
    
    // Only process if we're not dropping on the same element
    if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index, 10);
        const toIndex = parseInt(this.dataset.index, 10);
        
        // Check if both indices are valid numbers (reordering existing items)
        if (!isNaN(fromIndex) && !isNaN(toIndex)) {
            // Reorder items in the timeline
            const [movedItem] = timeline.splice(fromIndex, 1);
            timeline.splice(toIndex, 0, movedItem);
        } 
        // Check if the item is coming from the available actions
        else if (draggedItem.closest('#available-actions')) {
            // Add new item from available actions
            const actionData = JSON.parse(draggedItem.dataset.action);
            // Create a new object to avoid reference issues
            const newAction = JSON.parse(JSON.stringify(actionData));
            // Add count property with default value from global multiplier
            newAction.count = parseInt(document.getElementById('multiplier-value').value) || 1;
            timeline.push(newAction);
        }
        
        // Only render the timeline once after all modifications
        renderTimeline();
    }
    
    // Clean up drop zone styling
    this.classList.remove('drop-zone');
    
    // Prevent any further propagation
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drop-zone');
}

function handleDragLeave() {
    this.classList.remove('drop-zone');
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    actionSearchEl.addEventListener('input', (e) => {
        renderAvailableActions(e.target.value);
    });
    
    // Simulation controls
    runSimulationBtn.addEventListener('click', runSimulation);
    clearTimelineBtn.addEventListener('click', clearTimeline);
    
    // Learning import controls
    importLearningBtn.addEventListener('click', () => {
        csvFileInput.click(); // Trigger file picker
    });
    
    csvFileInput.addEventListener('change', handleLearningCSVImport);
    
    // Setup toggle graph button
    if (toggleGraphBtn) {
        toggleGraphBtn.addEventListener('click', toggleVitalsGraph);
    } else {
        console.error('Toggle graph button not found during setup!');
    }
    
    // Location selector
    locationSelectEl.addEventListener('change', (e) => {
        gameState.location = e.target.value;
        currentLocationEl.textContent = gameState.location;
        
        // Filter available actions based on new location
        renderAvailableActions(actionSearchEl.value);
    });
    
    // Timeline drop target
    timelineEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        timelineEl.classList.add('drag-over');
    });
    
    timelineEl.addEventListener('dragleave', () => {
        timelineEl.classList.remove('drag-over');
    });
    
    // Single drop handler for timeline
    timelineEl.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        timelineEl.classList.remove('drag-over');
        
        // Only process if we have a dragged item with action data
        if (draggedItem && draggedItem.dataset.action) {
            const actionData = JSON.parse(draggedItem.dataset.action);
            // Create a new object to avoid reference issues
            const newAction = JSON.parse(JSON.stringify(actionData));
            // Add count property with default value from global multiplier
            newAction.count = parseInt(document.getElementById('multiplier-value').value) || 1;
            timeline.push(newAction);
            renderTimeline();
        }
    });
    
    // Handle timeline action controls
    timelineEl.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        if (isNaN(index) || index < 0 || index >= timeline.length) {
            return;
        }
        
        if (e.target.classList.contains('remove-action')) {
            timeline.splice(index, 1);
            renderTimeline();
        } else if (e.target.classList.contains('increase-count')) {
            const step = parseInt(document.getElementById('multiplier-value').value) || 1;
            timeline[index].count = (timeline[index].count || 1) + step;
            renderTimeline();
        } else if (e.target.classList.contains('decrease-count')) {
            const step = parseInt(document.getElementById('multiplier-value').value) || 1;
            timeline[index].count = Math.max(0, (timeline[index].count || 1) - step);
            renderTimeline();
        }
    });
    
    // Global multiplier controls
    const multiplierIncreaseBtn = document.getElementById('multiplier-increase');
    const multiplierDecreaseBtn = document.getElementById('multiplier-decrease');
    const multiplierInput = document.getElementById('multiplier-value');
    
    multiplierIncreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(multiplierInput.value) || 1;
        multiplierInput.value = currentValue + 1;
    });
    
    multiplierDecreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(multiplierInput.value) || 1;
        multiplierInput.value = Math.max(1, currentValue - 1);
    });
    
    // Validate multiplier input
    multiplierInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) {
            e.target.value = 1;
        }
    });
    
    // Window resize handler - update graph if visible
    window.addEventListener('resize', () => {
        if (isGraphVisible) {
            updateVitalsGraph();
        }
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
