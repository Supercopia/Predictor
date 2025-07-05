import { constants } from './constants.js';

// Load locations data for area resources
let locationsData = { locations: [] };

// Try to load locations dynamically
(async () => {
    try {
        const response = await fetch('/data/locations.json');
        locationsData = await response.json();
        console.log('Loaded locations for area resources:', locationsData.locations.length);
    } catch (error) {
        console.warn('Failed to load locations.json for area resources, using defaults:', error);
    }
})();

class AreaResources {
    constructor() {
        this.resources = new Map();
        this.generators = new Map();
        this.initialize();
    }

    initialize() {
        // Initialize area resources from locations data
        locationsData.locations.forEach(location => {
            if (location.areaResources) {
                // Set up resources for this location
                if (location.areaResources.resources) {
                    const locationResources = {};
                    // Add current field at runtime, initialized to initial value
                    for (const [resourceType, resourceData] of Object.entries(location.areaResources.resources)) {
                        locationResources[resourceType] = {
                            ...resourceData,
                            current: resourceData.initial
                        };
                    }
                    this.resources.set(location.name, locationResources);
                }
                
                // Set up generators for this location
                if (location.areaResources.generators && Object.keys(location.areaResources.generators).length > 0) {
                    this.generators.set(location.name, { ...location.areaResources.generators });
                }
            }
        });
        
        // Fallback initialization for compatibility (if locations.json fails to load)
        if (locationsData.locations.length === 0) {
            console.warn('Falling back to hardcoded area resources');
            this.resources.set('Inside Talos', {
                air: { current: 50, initial: 50, maximum: 50 }
            });
            this.generators.set('Inside Talos', {
                air: constants.areaResources.airGenerationRate
            });
        }
    }

    resetResources() {
        // Reset all resources to initial values (called at loop start)
        for (const [location, resources] of this.resources) {
            for (const [resourceType, data] of Object.entries(resources)) {
                data.current = data.initial;
            }
        }
    }

    getAreaResource(location, resourceType) {
        const locationResources = this.resources.get(location);
        if (!locationResources || !locationResources[resourceType]) {
            return null;
        }
        return locationResources[resourceType];
    }

    consumeAreaResource(location, resourceType, amount) {
        const resource = this.getAreaResource(location, resourceType);
        if (!resource) return 0;
        
        // Unlimited resource
        if (resource.current === -1) {
            return amount;
        }
        
        // Limited resource
        const availableAmount = Math.max(0, resource.current);
        const consumedAmount = Math.min(amount, availableAmount);
        resource.current -= consumedAmount;
        
        return consumedAmount;
    }

    getGenerationRate(location, resourceType) {
        const locationGenerators = this.generators.get(location);
        if (!locationGenerators || !locationGenerators[resourceType]) {
            return 0;
        }
        return locationGenerators[resourceType];
    }

    applyGeneration(location, resourceType, deltaTime) {
        const generationRate = this.getGenerationRate(location, resourceType);
        if (generationRate === 0) return;

        const resource = this.getAreaResource(location, resourceType);
        if (!resource) return;

        // Don't generate if unlimited
        if (resource.current === -1) return;

        // Apply generation
        const generatedAmount = generationRate * deltaTime;
        resource.current = Math.max(0, resource.current + generatedAmount);
        
        // Cap at maximum value (or unlimited if no maximum specified)
        if (resource.maximum !== undefined) {
            resource.current = Math.min(resource.current, resource.maximum);
        }
    }

    stopGeneration(location, resourceType) {
        const locationGenerators = this.generators.get(location);
        if (locationGenerators && locationGenerators[resourceType]) {
            locationGenerators[resourceType] = 0;
        }
    }

    getAllResources() {
        const result = {};
        for (const [location, resources] of this.resources) {
            result[location] = {};
            for (const [resourceType, data] of Object.entries(resources)) {
                result[location][resourceType] = {
                    current: data.current,
                    initial: data.initial,
                    generation: this.getGenerationRate(location, resourceType)
                };
            }
        }
        return result;
    }
}

export { AreaResources };