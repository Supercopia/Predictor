// Diagnostics script to identify loading issues
(function() {
    // Create diagnostic UI
    const diagnosticUI = document.createElement('div');
    diagnosticUI.id = 'diagnostic-panel';
    diagnosticUI.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 10px;
        background-color: rgba(0,0,0,0.8);
        color: white;
        font-family: monospace;
        z-index: 10000;
        font-size: 12px;
        max-height: 50%;
        overflow: auto;
    `;
    document.body.appendChild(diagnosticUI);
    
    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 3px 8px;
        background: #555;
        border: none;
        color: white;
        cursor: pointer;
    `;
    closeButton.onclick = () => diagnosticUI.style.display = 'none';
    diagnosticUI.appendChild(closeButton);
    
    // Track last log time to prevent flooding
    let lastLogTime = 0;
    const logDebounceTime = 1000; // 1 second
    const requestLogs = new Map();
    
    // Log to both console and diagnostic UI
    function logDiagnostic(message, type = 'info') {
        const now = Date.now();
        
        // Skip if we've logged this message recently
        if (now - lastLogTime < logDebounceTime) {
            return;
        }
        lastLogTime = now;
        
        const entry = document.createElement('div');
        entry.style.cssText = `
            margin: 5px 0;
            padding: 5px;
            border-bottom: 1px solid #333;
            ${type === 'error' ? 'color: #ff5555;' : ''}
            ${type === 'success' ? 'color: #55ff55;' : ''}
            ${type === 'warn' ? 'color: #ffff55;' : ''}
        `;
        
        // Format object messages
        if (typeof message === 'object') {
            try {
                message = JSON.stringify(message, null, 2);
            } catch (e) {
                message = message.toString();
            }
        }
        
        entry.textContent = `[${type.toUpperCase()}] ${message}`;
        diagnosticUI.appendChild(entry);
        
        // Also log to console
        console[type === 'info' ? 'log' : type](message);
        
        // Scroll to bottom
        diagnosticUI.scrollTop = diagnosticUI.scrollHeight;
    }
    
    // Global log function
    window.logDiagnostic = logDiagnostic;
    
    // Collect environment information
    logDiagnostic('Starting diagnostics...', 'info');
    logDiagnostic(`URL: ${window.location.href}`, 'info');
    logDiagnostic(`User Agent: ${navigator.userAgent}`, 'info');
    logDiagnostic(`Origin: ${window.location.origin}`, 'info');
    logDiagnostic(`Protocol: ${window.location.protocol}`, 'info');
    
    // Test network connectivity
    logDiagnostic('Testing network connectivity...', 'info');
    
    // Check basic static file
    fetch('/css/styles.css?' + Date.now())
        .then(response => {
            if (response.ok) {
                logDiagnostic('CSS file accessible', 'success');
            } else {
                logDiagnostic(`CSS file error: ${response.status}`, 'error');
            }
            return response;
        })
        .catch(error => {
            logDiagnostic(`CSS fetch error: ${error.message}`, 'error');
        });
    
    // Check actions.json through various paths
    const actionPaths = [
        '/data/actions.json',
        '../data/actions.json',
        './data/actions.json',
        '/api/actions'
    ];
    
    Promise.all(actionPaths.map(path => {
        return fetch(path + '?' + Date.now())
            .then(response => {
                const status = response.ok ? 'success' : 'error';
                logDiagnostic(`Action path ${path}: ${response.status}`, status);
                return response.ok ? response.json() : null;
            })
            .then(data => {
                if (data) {
                    logDiagnostic(`Found ${Object.keys(data).length} actions in ${path}`, 'success');
                }
                return data;
            })
            .catch(error => {
                logDiagnostic(`Failed to fetch ${path}: ${error.message}`, 'error');
                return null;
            });
    })).then(results => {
        const successfulLoads = results.filter(Boolean).length;
        logDiagnostic(`Successfully loaded actions from ${successfulLoads}/${actionPaths.length} paths`, 
            successfulLoads > 0 ? 'success' : 'error');
    });
    
    // Check JavaScript modules
    const scriptPaths = [
        '/src/predictor_engine.js',
        '/src/actions.js',
        '/js/app.js'
    ];
    
    scriptPaths.forEach(path => {
        const script = document.createElement('script');
        script.type = 'module';
        script.onload = () => logDiagnostic(`Module ${path} loaded successfully`, 'success');
        script.onerror = (e) => logDiagnostic(`Module ${path} failed to load: ${e}`, 'error');
        script.src = path + '?' + Date.now();
        document.head.appendChild(script);
    });
    
    // Test module import directly
    try {
        import('/src/predictor_engine.js?' + Date.now())
            .then(module => {
                logDiagnostic('Predictor engine module imported successfully', 'success');
                if (module.evaluateActionList) {
                    logDiagnostic('evaluateActionList function found in module', 'success');
                } else {
                    logDiagnostic('evaluateActionList function NOT found in module', 'error');
                }
            })
            .catch(error => {
                logDiagnostic(`Import error: ${error.message}`, 'error');
            });
    } catch (error) {
        logDiagnostic(`Dynamic import not supported: ${error.message}`, 'error');
    }
    
    // Add fix button
    const fixButton = document.createElement('button');
    fixButton.textContent = 'Apply Path Fixes';
    fixButton.style.cssText = `
        margin: 10px;
        padding: 5px 10px;
        background: #007bff;
        border: none;
        color: white;
        cursor: pointer;
    `;
    fixButton.onclick = () => {
        logDiagnostic('Applying path fixes...', 'info');
        
        // Create a simpler version of the app without modules
        const fixScript = document.createElement('script');
        fixScript.src = '/js/fixed-app.js?' + Date.now();
        document.head.appendChild(fixScript);
        
        logDiagnostic('Applied fixes - reloading in 3 seconds...', 'info');
        setTimeout(() => window.location.reload(true), 3000);
    };
    diagnosticUI.appendChild(fixButton);
    
    logDiagnostic('Diagnostics initialized', 'success');
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const startTime = Date.now();
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
        
        // Skip logging for certain URLs if needed
        if (url.includes('favicon.ico') || url.includes('hot-update')) {
            return originalFetch.apply(this, args);
        }
        
        const requestId = `${url}-${startTime}`;
        requestLogs.set(requestId, {
            url,
            startTime,
            status: 'pending'
        });
        
        logDiagnostic(`Fetching: ${url}`, 'info');
        
        try {
            const response = await originalFetch.apply(this, args);
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            requestLogs.set(requestId, {
                ...requestLogs.get(requestId),
                endTime,
                duration,
                status: response.ok ? 'success' : 'error',
                statusCode: response.status
            });
            
            logDiagnostic(`Fetched: ${url} (${response.status}) in ${duration}ms`, response.ok ? 'success' : 'error');
            return response;
        } catch (error) {
            const endTime = Date.now();
            requestLogs.set(requestId, {
                ...requestLogs.get(requestId),
                endTime,
                status: 'failed',
                error: error.message
            });
            logDiagnostic(`Fetch failed: ${url} - ${error.message}`, 'error');
            throw error;
        }
    };
    
    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this._requestUrl = url;
        this._requestMethod = method;
        this._startTime = Date.now();
        
        this.addEventListener('load', function() {
            const duration = Date.now() - this._startTime;
            logDiagnostic(`XHR ${this._requestMethod} ${this._requestUrl} (${this.status}) in ${duration}ms`, 
                         this.status >= 400 ? 'error' : 'info');
        });
        
        originalXHROpen.apply(this, arguments);
    };
    
    // Log potential event listener issues
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        // Skip some common events that fire frequently
        const noisyEvents = ['mousemove', 'scroll', 'resize', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchmove'];
        if (noisyEvents.includes(type)) {
            return originalAddEventListener.call(this, type, listener, { ...options, passive: true });
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    logDiagnostic('Enhanced network monitoring enabled', 'success');
})();
