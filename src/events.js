import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const eventsData = require('../data/events.json');

class Events {
    constructor() {
        this.events = new Map();
        this.initialize();
    }

    initialize() {
        // Initialize events from JSON data
        eventsData.events.forEach(eventData => {
            this.events.set(eventData.id, {
                name: eventData.name,
                triggerTime: eventData.triggerTime,
                triggered: false,
                effects: eventData.effects,
                visible: eventData.visible
            });
        });
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

    isHungerActive(currentTime) {
        // Returns true if hunger (food drain) should be active
        // Find hunger start time from events data
        const hungerEvent = eventsData.events.find(event => event.id === 'hunger_starts');
        const hungerStartTime = hungerEvent?.triggerTime || 60;
        return currentTime >= hungerStartTime;
    }
}

export { Events };