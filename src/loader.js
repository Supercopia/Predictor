// Dual environment compatibility layer for loading JSON data
// Works in both browser (using fetch) and Node.js (using require)

// Environment detection
const isBrowser = typeof window !== 'undefined';

async function loadJSON(path) {
    if (isBrowser) {
        // Browser: use fetch API with absolute paths
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } else {
        // Node.js: use require with relative paths
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        return require(path.replace('/data/', '../data/'));
    }
}

// Load all JSON data using top-level await
export const constants = await loadJSON('/data/constants.json');
export const actions = await loadJSON('/data/actions.json');
export const eventsData = await loadJSON('/data/events.json');