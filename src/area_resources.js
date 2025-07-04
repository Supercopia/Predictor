import { constants } from './constants.js';

class AreaResources {
    constructor() {
        this.resources = new Map();
        this.generators = new Map();
        this.initialize();
    }

    initialize() {
        // Initialize area resources for each location
        this.resources.set('Talos', {
            air: { current: 50, initial: 50 }
        });
        
        this.resources.set('Laurion', {
            air: { current: 30, initial: 30 }, // Placeholder value
            power: { current: 25, initial: 25 }  // Placeholder value
        });
        
        this.resources.set('Santorini', {
            power: { current: -1, initial: -1 }  // -1 = unlimited
        });

        // Initialize generators (resource generation rates)
        this.generators.set('Talos', {
            air: constants.areaResources.airGenerationRate  // Air generation rate
        });
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
        
        // Cap at initial value (resources don't go above their starting capacity)
        resource.current = Math.min(resource.current, resource.initial);
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