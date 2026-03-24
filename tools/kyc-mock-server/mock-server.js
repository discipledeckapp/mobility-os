import express from 'express';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '4001', 10);

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/youverify/nin', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      nin: '12345678901',
      first_name: 'Seyi',
      last_name: 'Adelaju',
      date_of_birth: '1992-05-20',
      photo: 'base64_mock_image',
    },
  });
});

app.post('/smile/verify', (_req, res) => {
  res.json({
    success: true,
    result: {
      confidence: 0.98,
      matched: true,
    },
  });
});

app.post('/azure-face/detect', (_req, res) => {
  res.json({
    faceId: 'mock-face-id',
    confidence: 0.99,
  });
});

app.listen(port, () => {
  console.log(`Mock KYC server listening on port ${port}`);
});
