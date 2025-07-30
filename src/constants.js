// Constants will be loaded dynamically using Electron API
// This file now serves as a placeholder for import compatibility

let constants = null;

// Load constants using Electron API
async function loadConstants() {
    if (!constants && window.electronAPI) {
        constants = await window.electronAPI.loadConstants();
    }
    return constants;
}

export { constants, loadConstants };