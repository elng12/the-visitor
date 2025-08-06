// Advanced Game Proxy Server for better performance
// This can be deployed on Vercel, Netlify, or your own server

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const compression = require('compression');
const app = express();

// Enable compression for better performance
app.use(compression());

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cache headers for static assets
const cacheHeaders = (req, res, next) => {
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (req.url.match(/\.(html|htm)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    next();
};

app.use(cacheHeaders);

// Proxy configuration for CrazyGames
const gameProxy = createProxyMiddleware({
    target: 'https://games.crazygames.com',
    changeOrigin: true,
    secure: true,
    followRedirects: true,
    onProxyReq: (proxyReq, req, res) => {
        // Add headers to make the request look legitimate
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
        proxyReq.setHeader('Accept-Encoding', 'gzip, deflate');
        proxyReq.setHeader('Referer', 'https://www.crazygames.com/');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Remove restrictive headers
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers['x-content-type-options'];
        
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
    }
});

// Route for game proxy
app.use('/game', gameProxy);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Game proxy server running on port ${PORT}`);
    console.log(`🎮 Game URL: http://localhost:${PORT}/game/en_US/the-visitor/index.html`);
});

module.exports = app;