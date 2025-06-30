class Events {
    constructor() {
        this.events = new Map();
        this.initialize();
    }

    initialize() {
        // Initialize events with their timing and effects
        this.events.set('hunger_starts', {
            name: 'Hunger Starts',
            triggerTime: 60, // 60 seconds
            triggered: false,
            effects: [
                { type: 'startResourceDrain', resource: 'food' }
            ]
        });

        this.events.set('carbon_filters_fail', {
            name: 'Carbon Filters Fail',
            triggerTime: 120, // 120 seconds
            triggered: false,
            effects: [
                { type: 'stopAreaGeneration', location: 'Talos', resource: 'air' }
            ]
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
        // Hunger starts at 60 seconds, so before that we're satiated
        return currentTime >= 60;
    }
}

export { Events };