// Import game engine with error handling
let evaluateActionList;

// Try different relative paths to handle various browser environments
const importPaths = [
    '../src/predictor_engine.js',
    '/src/predictor_engine.js',
    './src/predictor_engine.js'
];

// Function to attempt imports from different paths
async function loadDependencies() {
    let loaded = false;
    let lastError = null;
    
    for (const path of importPaths) {
        try {
            console.log(`Attempting to import from: ${path}`);
            const module = await import(path + '?v=' + Date.now());
            evaluateActionList = module.evaluateActionList;
            console.log('Successfully loaded predictor engine');
            loaded = true;
            break;
        } catch (error) {
            console.warn(`Failed to import from ${path}:`, error);
            lastError = error;
        }
    }
    
    if (!loaded) {
        console.error('Failed to load dependencies after multiple attempts:', lastError);
        showError('Failed to load application dependencies. Please check console for details.');
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
    
    document.body.appendChild(successEl);
    setTimeout(() => successEl.remove(), 3000);
}

// DOM Elements
const availableActionsEl = document.getElementById('available-actions');
const timelineEl = document.getElementById('timeline');
const actionSearchEl = document.getElementById('action-search');
const runSimulationBtn = document.getElementById('run-simulation');
const clearTimelineBtn = document.getElementById('clear-timeline');
const toggleGraphBtn = document.getElementById('toggle-graph');
const totalTimeEl = document.getElementById('total-time');
const inventoryEl = document.getElementById('inventory');
const currentLocationEl = document.getElementById('current-location');
const locationSelectEl = document.getElementById('location-select');
const vitalsGraphEl = document.getElementById('vitals-graph');
const currentTimeIndicatorEl = document.getElementById('current-time-indicator');

// Graph elements
const airGraphEl = document.getElementById('air-graph');
const waterGraphEl = document.getElementById('water-graph');
const foodGraphEl = document.getElementById('food-graph');
const graphTimeMarkersEl = document.getElementById('graph-time-markers');

// Game state
let gameState = {
    air: 100,
    water: 100,
    food: 100,
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
                ${action.locationRequirement ? `<span>Location: ${action.locationRequirement}</span>` : ''}
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
        totalTime += action.time || 1;
        
        const actionEl = document.createElement('div');
        actionEl.className = 'timeline-item';
        actionEl.draggable = true;
        actionEl.dataset.index = index;
        
        actionEl.innerHTML = `
            <button class="remove-action" data-index="${index}">&times;</button>
            <div class="action-name">${action.name}</div>
            <div class="action-time">Time: ${action.time || 1}s</div>
            ${action.location ? `<div class="action-location">→ ${action.location}</div>` : ''}
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
    // Update vitals
    document.querySelector('#air-display .vital-label span').textContent = Math.round(gameState.air);
    document.querySelector('#water-display .vital-label span').textContent = Math.round(gameState.water);
    document.querySelector('#food-display .vital-label span').textContent = Math.round(gameState.food);
    
    document.querySelector('#air-display .vital-fill').style.width = `${gameState.air}%`;
    document.querySelector('#water-display .vital-fill').style.width = `${gameState.water}%`;
    document.querySelector('#food-display .vital-fill').style.width = `${gameState.food}%`;
    
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

// Update vitals graph based on simulation history
function updateVitalsGraph() {
    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.graph-marker');
    existingMarkers.forEach(marker => marker.remove());

    if (simulationHistory.length === 0) return;

    // Calculate the total timeline duration for scaling
    const maxTime = Math.max(gameState.timeElapsed, 90); // At least 90s for scale

    // Update time markers for the graph
    const timeMarkers = [];
    for (let i = 0; i <= 3; i++) {
        timeMarkers.push(Math.round(maxTime * (i / 3)));
    }

    // Update the time marker labels
    const markerEls = graphTimeMarkersEl.querySelectorAll('span');
    for (let i = 0; i < markerEls.length; i++) {
        markerEls[i].textContent = `${timeMarkers[i]}s`;
    }

    // Add data points to the graph for each vital
    simulationHistory.forEach(point => {
        const timePercent = (point.timeElapsed / maxTime) * 100;

        // Air marker
        addGraphMarker(airGraphEl, point.air, timePercent);

        // Water marker
        addGraphMarker(waterGraphEl, point.water, timePercent);

        // Food marker
        addGraphMarker(foodGraphEl, point.food, timePercent);
    });
}

// Helper function to add markers to the graph
function addGraphMarker(parentEl, value, xPosition) {
    const marker = document.createElement('div');
    marker.className = 'graph-marker';

    // Add class based on vital level
    if (value <= 20) {
        marker.classList.add('danger');
    } else if (value <= 50) {
        marker.classList.add('warning');
    } else {
        marker.classList.add('ok');
    }

    marker.style.left = `${xPosition}%`;
    parentEl.appendChild(marker);
}

// Toggle vitals graph visibility
function toggleVitalsGraph() {
    isGraphVisible = !isGraphVisible;
    vitalsGraphEl.style.display = isGraphVisible ? 'block' : 'none';
    toggleGraphBtn.textContent = isGraphVisible ? 'Hide Vitals Graph' : 'Show Vitals Graph';

    if (isGraphVisible) {
        updateVitalsGraph();
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
        
        // Extract action names from the timeline objects
        const actionNames = timelineActions.map(action => 
            typeof action === 'string' ? action : action.name
        );
        console.log('Running simulation with actions:', actionNames);
        
        // Run the simulation using the engine with action names
        const result = await evaluateActionList(actionNames);
        
        if (!result || !result.timeline) {
            throw new Error('Invalid simulation result returned from engine');
        }
        
        // Add timeline states to our simulation history
        if (result.timeline && result.timeline.length > 0) {
            result.timeline.forEach(state => {
                simulationHistory.push({
                    air: state.air,
                    water: state.water,
                    food: state.food,
                    inventory: state.inventory,
                    location: state.location,
                    timeElapsed: state.timeElapsed
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
        air: 100,
        water: 100,
        food: 100,
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
    toggleGraphBtn.addEventListener('click', toggleVitalsGraph);
    
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
            timeline.push(newAction);
            renderTimeline();
        }
    });
    
    // Remove action from timeline
    timelineEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-action')) {
            const index = parseInt(e.target.dataset.index, 10);
            if (!isNaN(index) && index >= 0 && index < timeline.length) {
                timeline.splice(index, 1);
                renderTimeline();
            }
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
