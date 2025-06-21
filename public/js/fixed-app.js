// fixed-app.js - A simplified version that doesn't use ES modules
// This is a fallback for environments that have trouble with ES modules

(function() {
    console.log('Loading fixed app version...');
    
    // Global state
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
    
    // DOM Elements once they're available
    let availableActionsEl, timelineEl, inventoryEl, currentLocationEl;
    let airDisplayEl, waterDisplayEl, foodDisplayEl;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded - initializing fixed app');
        
        // Get DOM elements
        availableActionsEl = document.getElementById('available-actions');
        timelineEl = document.getElementById('timeline');
        inventoryEl = document.getElementById('inventory');
        currentLocationEl = document.getElementById('current-location');
        
        // Vitals display elements
        airDisplayEl = document.querySelector('#air-display .vital-fill');
        waterDisplayEl = document.querySelector('#water-display .vital-fill');
        foodDisplayEl = document.querySelector('#food-display .vital-fill');
        
        // Set up buttons
        document.getElementById('run-simulation').addEventListener('click', runSimulation);
        document.getElementById('clear-timeline').addEventListener('click', clearTimeline);
        
        // Load actions directly
        loadActions();
    });
    
    // Load actions directly
    function loadActions() {
        const actionPaths = [
            '/data/actions.json',
            '../data/actions.json',
            './data/actions.json',
            '/api/actions'
        ];
        
        // Track loading state
        let isLoading = false;
        let retryCount = 0;
        const maxRetries = 2;
        const retryDelay = 1000; // 1 second
        
        // Try each path
        tryNextPath(0);
        
        function tryNextPath(index) {
            if (isLoading) return; // Prevent multiple simultaneous requests
            
            if (index >= actionPaths.length) {
                if (retryCount < maxRetries) {
                    // Retry all paths
                    retryCount++;
                    console.log(`Retrying all paths (attempt ${retryCount}/${maxRetries})...`);
                    setTimeout(() => tryNextPath(0), retryDelay);
                    return;
                }
                
                console.error('Failed to load actions from all paths after retries');
                showMessage('Failed to load actions. Using fallback actions.', 'error');
                
                // Use fallback actions
                actions = {
                    "Explore": { name: "Explore", time: 10, location: "Camp" },
                    "Rest": { name: "Rest", time: 5, location: "Camp" },
                    "Gather": { name: "Gather", time: 15, location: "Camp", inventory: {"Water Bottle": 1} }
                };
                
                renderAvailableActions();
                return;
            }
            
            const path = actionPaths[index];
            console.log(`Trying to load actions from ${path}`);
            
            isLoading = true;
            
            // Add timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                console.warn(`Timeout loading from ${path}`);
                if (isLoading) {
                    isLoading = false;
                    tryNextPath(index + 1);
                }
            }, 5000); // 5 second timeout
            
            fetch(path + '?' + Date.now())
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    clearTimeout(timeoutId);
                    if (!data || Object.keys(data).length === 0) {
                        throw new Error('Empty response');
                    }
                    
                    console.log(`Loaded ${Object.keys(data).length} actions from ${path}`);
                    actions = data;
                    renderAvailableActions();
                    loadLocations();
                    isLoading = false;
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    console.warn(`Failed to load from ${path}:`, error.message);
                    isLoading = false;
                    tryNextPath(index + 1);
                });
        }
    }
    
    // Load locations
    function loadLocations() {
        fetch('/data/locations.json?' + Date.now())
            .then(response => response.json())
            .then(data => {
                locations = data;
                console.log('Loaded locations:', Object.keys(locations));
            })
            .catch(error => {
                console.error('Failed to load locations:', error);
            });
    }
    
    // Render available actions
    function renderAvailableActions() {
        if (!availableActionsEl) return;
        
        availableActionsEl.innerHTML = '';
        
        if (Object.keys(actions).length === 0) {
            availableActionsEl.innerHTML = '<div class="loading">Loading actions...</div>';
            return;
        }
        
        Object.entries(actions).forEach(([name, details]) => {
            const actionEl = document.createElement('div');
            actionEl.className = 'action-item';
            actionEl.draggable = true;
            
            // Store action data
            actionEl.dataset.action = JSON.stringify({
                name,
                ...details
            });
            
            // Create action content
            actionEl.innerHTML = `
                <div class="action-header">
                    <h4>${name}</h4>
                    <button class="view-action-details" title="View details">👁️</button>
                </div>
                <div class="action-meta">
                    <span>Time: ${details.time || 0}s</span>
                    <span>Location: ${details.location || 'Any'}</span>
                </div>
            `;
            
            // Add drag event
            actionEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', actionEl.dataset.action);
                actionEl.classList.add('dragging');
            });
            
            actionEl.addEventListener('dragend', () => {
                actionEl.classList.remove('dragging');
            });
            
            availableActionsEl.appendChild(actionEl);
        });
        
        // Action details view
        availableActionsEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-action-details')) {
                const actionItem = e.target.closest('.action-item');
                const actionData = JSON.parse(actionItem.dataset.action);
                showActionDetails(actionData);
            }
        });
    }
    
    // Show action details
    function showActionDetails(action) {
        const modal = document.getElementById('action-details-modal');
        const nameEl = document.getElementById('modal-action-name');
        const jsonEl = document.getElementById('modal-action-json');
        
        nameEl.textContent = action.name;
        jsonEl.textContent = JSON.stringify(action, null, 2);
        
        modal.style.display = 'block';
        
        // Close modal when clicking X
        modal.querySelector('.close-modal').onclick = () => {
            modal.style.display = 'none';
        };
        
        // Close modal when clicking outside
        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
    
    // Setup timeline drop zone
    if (timelineEl) {
        timelineEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            timelineEl.classList.add('drag-over');
        });
        
        timelineEl.addEventListener('dragleave', () => {
            timelineEl.classList.remove('drag-over');
        });
        
        timelineEl.addEventListener('drop', (e) => {
            e.preventDefault();
            timelineEl.classList.remove('drag-over');
            
            try {
                const actionData = JSON.parse(e.dataTransfer.getData('text/plain'));
                timeline.push(actionData);
                renderTimeline();
            } catch (error) {
                console.error('Error adding action to timeline:', error);
            }
        });
    }
    
    // Render timeline
    function renderTimeline() {
        if (!timelineEl) return;
        
        timelineEl.innerHTML = '';
        
        if (timeline.length === 0) {
            timelineEl.innerHTML = '<div class="empty-state">Drag actions here to build your timeline</div>';
            return;
        }
        
        let totalTime = 0;
        
        timeline.forEach((action, index) => {
            const time = action.time || 0;
            totalTime += time;
            
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="action-name">${action.name}</div>
                <div class="action-time">Time: ${time}s</div>
                <button class="remove-action" data-index="${index}">&times;</button>
            `;
            
            timelineEl.appendChild(timelineItem);
        });
        
        // Update total time
        document.getElementById('total-time').textContent = `${totalTime}s`;
        
        // Add remove handlers
        timelineEl.querySelectorAll('.remove-action').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index, 10);
                if (!isNaN(index) && index >= 0 && index < timeline.length) {
                    timeline.splice(index, 1);
                    renderTimeline();
                }
            });
        });
    }
    
    // Update game state display
    function updateGameState() {
        // Update vitals
        if (airDisplayEl) {
            airDisplayEl.style.width = `${gameState.air}%`;
        }
        if (waterDisplayEl) {
            waterDisplayEl.style.width = `${gameState.water}%`;
        }
        if (foodDisplayEl) {
            foodDisplayEl.style.width = `${gameState.food}%`;
        }
        
        // Update labels
        document.querySelector('#air-display .vital-label span').textContent = Math.round(gameState.air);
        document.querySelector('#water-display .vital-label span').textContent = Math.round(gameState.water);
        document.querySelector('#food-display .vital-label span').textContent = Math.round(gameState.food);
        
        // Update inventory
        if (inventoryEl) {
            inventoryEl.innerHTML = '';
            
            if (Object.keys(gameState.inventory).length === 0) {
                inventoryEl.innerHTML = '<div class="empty">Empty</div>';
            } else {
                Object.entries(gameState.inventory).forEach(([item, quantity]) => {
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
        }
        
        // Update location
        if (currentLocationEl) {
            currentLocationEl.textContent = gameState.location;
        }
    }
    
    // Run simulation
    function runSimulation() {
        if (timeline.length === 0) {
            showMessage('Cannot run simulation: Timeline is empty', 'error');
            return;
        }
        
        // Reset game state
        gameState = {
            air: 100,
            water: 100,
            food: 100,
            inventory: {},
            location: "Camp",
            timeElapsed: 0,
            loopFailed: false,
            failureReason: null
        };
        
        // Clear simulation history
        simulationHistory = [{ ...gameState }];
        
        // Consumption rates
        const rates = {
            air: 0.1,
            water: 0.1,
            food: 0.1
        };
        
        // Process each action
        let failed = false;
        
        for (const action of timeline) {
            if (failed) break;
            
            // Apply time cost
            const timeCost = action.time || 1;
            gameState.timeElapsed += timeCost;
            
            // Apply vital drain
            gameState.air = Math.max(0, gameState.air - (rates.air * timeCost));
            gameState.water = Math.max(0, gameState.water - (rates.water * timeCost));
            gameState.food = Math.max(0, gameState.food - (rates.food * timeCost));
            
            // Update location if specified
            if (action.location) {
                gameState.location = action.location;
            }
            
            // Apply inventory effects
            if (action.inventory) {
                Object.entries(action.inventory).forEach(([item, quantity]) => {
                    gameState.inventory[item] = (gameState.inventory[item] || 0) + quantity;
                    
                    // Remove items with zero or negative quantity
                    if (gameState.inventory[item] <= 0) {
                        delete gameState.inventory[item];
                    }
                });
            }
            
            // Check for failure
            if (gameState.air <= 0) {
                gameState.loopFailed = true;
                gameState.failureReason = "Out of air!";
                failed = true;
            } else if (gameState.water <= 0) {
                gameState.loopFailed = true;
                gameState.failureReason = "Out of water!";
                failed = true;
            } else if (gameState.food <= 0) {
                gameState.loopFailed = true;
                gameState.failureReason = "Out of food!";
                failed = true;
            }
            
            // Add to simulation history
            simulationHistory.push({ ...gameState });
        }
        
        // Update display
        updateGameState();
        
        // Show result
        if (gameState.loopFailed) {
            showMessage(`Simulation failed: ${gameState.failureReason}`, 'error');
        } else {
            showMessage('Simulation completed successfully!', 'success');
        }
    }
    
    // Clear timeline
    function clearTimeline() {
        timeline = [];
        renderTimeline();
        
        // Reset game state
        gameState = {
            air: 100,
            water: 100,
            food: 100,
            inventory: {},
            location: "Camp",
            timeElapsed: 0,
            loopFailed: false,
            failureReason: null
        };
        
        updateGameState();
    }
    
    // Show message (error/success)
    function showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = type === 'error' ? 'error-message' : 'success-message';
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 5000);
        
        // Also log to console
        console[type === 'error' ? 'error' : 'log'](message);
    }
    
    // Expose key functions globally for debugging
    window.predictorApp = {
        renderAvailableActions,
        renderTimeline,
        runSimulation,
        clearTimeline,
        getState: () => ({ gameState, timeline, actions })
    };
    
    console.log('Fixed app loaded successfully!');
})();
