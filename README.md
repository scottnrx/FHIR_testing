# FHIR_testing

## JWK Set URL Server

This server hosts a JWK Set (JWKS) endpoint for FHIR testing, exposing an RSA public key so that FHIR clients can verify signed JWTs.

### Quick Start

```bash
npm install
node generate-keys.js   # generates RSA key pair (one-time)
npm start               # starts server on port 3000
```

### JWKS Endpoint

```
GET http://localhost:3000/.well-known/jwks.json
```

**Response:**

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "demo-key-1",
      "use": "sig",
      "alg": "RS256",
      "n": "<base64url modulus>",
      "e": "AQAB"
    }
  ]
}
```

### Other Endpoints

| Endpoint | Description |
|---|---|
| `GET /.well-known/jwks.json` | JWK Set with RSA public key |
| `GET /health` | Health check |

### Running Tests

```bash
npm test
```

### Files

| File | Description |
|---|---|
| `server.js` | Express server exposing the JWKS endpoint |
| `generate-keys.js` | Script to generate RSA key pair and JWKS file |
| `keys/jwks.json` | JWK Set served at `/.well-known/jwks.json` |
| `keys/public-key.pem` | RSA public key (SPKI PEM) |
| `keys/private-key.pem` | RSA private key — **keep secret, not committed** |
