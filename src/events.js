// Events data will be loaded dynamically using Electron API

let eventsData = null;

// Load events data using Electron API
async function loadEventsData() {
    if (!eventsData && window.electronAPI) {
        eventsData = await window.electronAPI.loadEvents();
    }
    return eventsData;
}

class Events {
    constructor() {
        this.events = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            const data = await loadEventsData();
            if (data && data.events) {
                // Initialize events from JSON data
                data.events.forEach(eventData => {
                    this.events.set(eventData.id, {
                        name: eventData.name,
                        triggerTime: eventData.triggerTime,
                        triggered: false,
                        effects: eventData.effects,
                        visible: eventData.visible
                    });
                });
                this.initialized = true;
            }
        }
    }

    resetEvents() {
        // Reset all events to initial state (called at loop start)
        for (const [eventId, event] of this.events) {
            event.triggered = false;
        }
    }

    processEvents(currentTime, gameState, areaResources) {
        const triggeredEvents = [];

        for (const [eventId, event] of this.events) {
            // Check if event should trigger
            if (!event.triggered && currentTime >= event.triggerTime) {
                event.triggered = true;
                
                // Apply event effects
                for (const effect of event.effects) {
                    this.applyEffect(effect, gameState, areaResources);
                }
                
                triggeredEvents.push({
                    id: eventId,
                    name: event.name,
                    time: currentTime
                });
            }
        }

        return triggeredEvents;
    }

    applyEffect(effect, gameState, areaResources) {
        switch (effect.type) {
            case 'startResourceDrain':
                // Hunger Starts - begin food drain
                // This is handled by the predictor engine's consumption logic
                // The satiated period (0-60s) is managed there
                break;
                
            case 'stopAreaGeneration':
                // Carbon Filters Fail - stop air generation at Talos
                if (areaResources) {
                    areaResources.stopGeneration(effect.location, effect.resource);
                }
                break;
                
            default:
                console.warn(`Unknown event effect type: ${effect.type}`);
        }
    }

    getEventStatus(currentTime) {
        const status = {};
        for (const [eventId, event] of this.events) {
            status[eventId] = {
                name: event.name,
                triggerTime: event.triggerTime,
                triggered: event.triggered,
                timeRemaining: event.triggered ? 0 : Math.max(0, event.triggerTime - currentTime)
            };
        }
        return status;
    }

    async isHungerActive(currentTime) {
        // Returns true if hunger (food drain) should be active
        // Find hunger start time from events data
        const data = await loadEventsData();
        if (!data || !data.events) return currentTime >= 60; // fallback
        
        const hungerEvent = data.events.find(event => event.id === 'hunger_starts');
        const hungerStartTime = hungerEvent?.triggerTime || 60;
        return currentTime >= hungerStartTime;
    }
}

export { Events };