// Vercel Serverless Function Entry Point
// Loads env vars and delegates to server.js handleRequest

require('dotenv').config();
const { handleRequest } = require('../server');

module.exports = async (req, res) => {
    try {
        return await handleRequest(req, res);
    } catch (err) {
        console.error('Serverless handler error:', err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error. Please try again.' }));
        }
    }
};
