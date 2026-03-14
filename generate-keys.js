/**
 * generate-keys.js
 *
 * Generates an RSA-2048 key pair and writes:
 *   - private-key.pem  (PKCS#8 PEM, keep secret)
 *   - public-key.pem   (SPKI PEM, safe to publish)
 *   - jwks.json        (JWK Set with the public key)
 */

'use strict';

const { generateKeyPairSync, createPublicKey } = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Export the public key as a JWK to extract n and e
const jwk = createPublicKey(publicKey).export({ format: 'jwk' });

const jwks = {
  keys: [
    {
      kty: 'RSA',
      kid: 'demo-key-1',
      use: 'sig',
      alg: 'RS256',
      n: jwk.n,
      e: jwk.e,
    },
  ],
};

const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

fs.writeFileSync(path.join(keysDir, 'private-key.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public-key.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'jwks.json'), JSON.stringify(jwks, null, 2));

console.log('Keys generated successfully in ./keys/');
console.log('  private-key.pem  – keep this secret');
console.log('  public-key.pem   – safe to publish');
console.log('  jwks.json        – served at /.well-known/jwks.json');
