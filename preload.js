const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Read JSON file from the file system
    readJsonFile: (filePath) => ipcRenderer.invoke('read-json-file', filePath),
    
    // Write JSON file to the file system
    writeJsonFile: (filePath, data) => ipcRenderer.invoke('write-json-file', filePath, data),
    
    // Helper methods for common file paths
    loadConstants: () => ipcRenderer.invoke('read-json-file', 'data/constants.json'),
    loadActions: () => ipcRenderer.invoke('read-json-file', 'data/actions.json'),
    loadEvents: () => ipcRenderer.invoke('read-json-file', 'data/events.json'),
    loadLocations: () => ipcRenderer.invoke('read-json-file', 'data/locations.json'),
    
    // Save modified data back to files
    saveActions: (data) => ipcRenderer.invoke('write-json-file', 'data/actions.json', data),
    saveConstants: (data) => ipcRenderer.invoke('write-json-file', 'data/constants.json', data),
    saveEvents: (data) => ipcRenderer.invoke('write-json-file', 'data/events.json', data),
    saveLocations: (data) => ipcRenderer.invoke('write-json-file', 'data/locations.json', data)
});