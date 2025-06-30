import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Track request frequency
const requestStats = new Map();
const REQUEST_THRESHOLD = 50; // Max requests per second per endpoint
const BAN_DURATION = 5000; // 5 seconds

// Debug middleware to log all requests with rate limiting
app.use((req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.connection.remoteAddress;
    const path = req.path;
    const key = `${ip}:${path}`;
    
    // Initialize or update request stats
    if (!requestStats.has(key)) {
        requestStats.set(key, {
            count: 1,
            firstSeen: now,
            lastSeen: now,
            bannedUntil: 0
        });
    } else {
        const stats = requestStats.get(key);
        
        // Check if IP is banned
        if (now < stats.bannedUntil) {
            console.warn(`[${new Date().toISOString()}] Rate limit exceeded for ${key} - too many requests`);
            return res.status(429).send('Too many requests');
        }
        
        // Reset counter if more than 1 second has passed
        if (now - stats.firstSeen > 1000) {
            stats.count = 1;
            stats.firstSeen = now;
        } else {
            stats.count++;
            
            // Check rate limit
            if (stats.count > REQUEST_THRESHOLD) {
                console.warn(`[${new Date().toISOString()}] Rate limiting ${key} - too many requests (${stats.count} in ${now - stats.firstSeen}ms)`);
                stats.bannedUntil = now + BAN_DURATION;
                return res.status(429).send('Too many requests');
            }
        }
        
        stats.lastSeen = now;
    }
    
    console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.originalUrl}`);
    next();
});

// CORS for all routes with enhanced options
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Set cross-origin headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Add cache control headers to prevent stale content
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.header('Surrogate-Control', 'no-store');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

/**
 * Set MIME types for all responses
 * This is critical for JS modules to work properly
 */
app.use((req, res, next) => {
    const ext = path.extname(req.path);
    
    // Set proper content type based on file extension
    if (ext === '.js') {
        res.type('application/javascript');
    } else if (ext === '.json') {
        res.type('application/json');
    } else if (ext === '.css') {
        res.type('text/css');
    } else if (ext === '.html') {
        res.type('text/html');
    }
    
    next();
});

// Helper function to serve static files with explicit content types and cache busting
async function serveStaticFile(res, filePath, contentType) {
    try {
        console.log(`Explicitly serving ${filePath} with content type ${contentType}`);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Set proper headers
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        res.send(content);
    } catch (error) {
        console.error(`Error serving ${filePath}:`, error);
        res.status(404).send('File not found');
    }
}

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Explicit route handlers for critical JavaScript modules
app.get('/src/predictor_engine.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'predictor_engine.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/src/actions.js', (req, res) => {
    const filePath = join(__dirname, 'public', 'src', 'actions.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/src/csv_parser.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'csv_parser.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/src/familiarity.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'familiarity.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/src/area_resources.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'area_resources.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/src/events.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'events.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

// Handle relative paths for JavaScript modules
app.get('/js/*/predictor_engine.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'predictor_engine.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/js/*/actions.js', (req, res) => {
    const filePath = join(__dirname, 'public', 'src', 'actions.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/js/*/csv_parser.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'csv_parser.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/js/*/familiarity.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'familiarity.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/js/*/area_resources.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'area_resources.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

app.get('/js/*/events.js', (req, res) => {
    const filePath = join(__dirname, 'src', 'events.js');
    serveStaticFile(res, filePath, 'application/javascript');
});

// JSON data routes - serve from root data directory
app.get('/data/actions.json', (req, res) => {
    const filePath = join(__dirname, 'data', 'actions.json');
    serveStaticFile(res, filePath, 'application/json');
});

app.get('/data/locations.json', (req, res) => {
    const filePath = join(__dirname, 'data', 'locations.json');
    serveStaticFile(res, filePath, 'application/json');
});

app.get('/locations.json', (req, res) => {
    const filePath = join(__dirname, 'data', 'locations.json');
    serveStaticFile(res, filePath, 'application/json');
});

// API endpoint for actions
app.get('/api/actions', async (req, res) => {
    try {
        const filePath = join(__dirname, 'data', 'actions.json');
        const content = await fs.readFile(filePath, 'utf-8');
        res.set('Content-Type', 'application/json');
        res.send(content);
    } catch (error) {
        console.error('Error serving actions:', error);
        res.status(500).send('Error loading actions');
    }
});

// Test route for server validation
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.send('Test successful!');
});

// Catch-all route handler for SPA navigation
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Test the server by visiting:');
    console.log(`- http://localhost:${PORT}/test`);
    console.log(`- http://localhost:${PORT}/js/app.js`);
    console.log(`- http://localhost:${PORT}/src/predictor_engine.js`);
});
