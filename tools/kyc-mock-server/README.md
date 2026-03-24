# KYC Mock Server

Minimal Express mock server for KYC provider integrations.

## Endpoints

- `GET /health`
- `POST /youverify/nin`
- `POST /smile/verify`
- `POST /azure-face/detect`

## Local Run

```bash
npm install
npm start
```

Default local port:

- `4001`

Override with:

```bash
PORT=4001 npm start
```

## Render

Use:

- Build command: `npm install`
- Start command: `npm start`

Environment:

- `PORT` is provided automatically by Render

