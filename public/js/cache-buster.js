// cache-buster.js - Forces fresh loading of resources
(function() {
    // Add timestamp to all dynamic resource requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string') {
            // Add timestamp to URL to prevent caching
            url = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
        }
        return originalFetch.call(this, url, options);
    };
    
    console.log('Cache buster initialized');
})();
