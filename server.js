'use strict';

/**
 * server.js
 *
 * Hosts a JWK Set endpoint at /.well-known/jwks.json so that FHIR clients
 * can retrieve the RSA public key used to verify signed JWTs.
 *
 * Usage:
 *   1. npm run generate-keys   # one-time key generation
 *   2. npm start               # start the server (default port 3000)
 *
 * The keys/ directory must exist before starting the server.
 * Run `node generate-keys.js` if it does not.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWKS_PATH = path.join(__dirname, 'keys', 'jwks.json');

// Load and cache JWKS at startup
let jwksCache = null;
if (fs.existsSync(JWKS_PATH)) {
  jwksCache = JSON.parse(fs.readFileSync(JWKS_PATH, 'utf8'));
}

// Serve the JWK Set at the standard well-known URL
app.get('/.well-known/jwks.json', (req, res) => {
  if (!jwksCache) {
    return res
      .status(503)
      .json({ error: 'JWKS not found. Run `node generate-keys.js` first.' });
  }

  res.set('Content-Type', 'application/json');
  res.json(jwksCache);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Only start listening when this module is run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FHIR JWK Set server running on http://localhost:${PORT}`);
    console.log(`  JWK Set URL: http://localhost:${PORT}/.well-known/jwks.json`);
  });
}

module.exports = app;
