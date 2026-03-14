'use strict';

/**
 * tests/jwks.test.js
 *
 * Tests for the JWK Set endpoint using Node's built-in test runner.
 * Run with: npm test
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');

let server;
let baseUrl;

before(() => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(() => {
  return new Promise((resolve) => server.close(resolve));
});

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

test('GET /.well-known/jwks.json returns 200', async () => {
  const { status } = await get(`${baseUrl}/.well-known/jwks.json`);
  assert.equal(status, 200);
});

test('GET /.well-known/jwks.json returns JSON content-type', async () => {
  const { headers } = await get(`${baseUrl}/.well-known/jwks.json`);
  assert.ok(
    headers['content-type'].includes('application/json'),
    `Expected application/json but got ${headers['content-type']}`
  );
});

test('GET /.well-known/jwks.json body has keys array', async () => {
  const { body } = await get(`${baseUrl}/.well-known/jwks.json`);
  const jwks = JSON.parse(body);
  assert.ok(Array.isArray(jwks.keys), 'keys should be an array');
  assert.ok(jwks.keys.length > 0, 'keys array should not be empty');
});

test('first key has required RSA JWK fields', async () => {
  const { body } = await get(`${baseUrl}/.well-known/jwks.json`);
  const jwks = JSON.parse(body);
  const key = jwks.keys[0];

  assert.equal(key.kty, 'RSA', 'kty should be RSA');
  assert.equal(key.use, 'sig', 'use should be sig');
  assert.equal(key.alg, 'RS256', 'alg should be RS256');
  assert.ok(typeof key.kid === 'string' && key.kid.length > 0, 'kid should be a non-empty string');
  assert.ok(typeof key.n === 'string' && key.n.length > 0, 'n (modulus) should be a non-empty base64url string');
  assert.ok(typeof key.e === 'string' && key.e.length > 0, 'e (exponent) should be a non-empty base64url string');
});

test('first key has expected kid value', async () => {
  const { body } = await get(`${baseUrl}/.well-known/jwks.json`);
  const jwks = JSON.parse(body);
  assert.equal(jwks.keys[0].kid, 'demo-key-1');
});

test('GET /health returns ok', async () => {
  const { status, body } = await get(`${baseUrl}/health`);
  assert.equal(status, 200);
  assert.equal(JSON.parse(body).status, 'ok');
});
