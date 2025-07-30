// Actions will be loaded dynamically using Electron API
// This file now serves as a placeholder for import compatibility

let actions = null;

// Load actions using Electron API
async function loadActions() {
    if (!actions && window.electronAPI) {
        actions = await window.electronAPI.loadActions();
    }
    return actions;
}

export { actions, loadActions };
