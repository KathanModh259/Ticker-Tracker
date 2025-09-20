// backend/server.js
// Main Express server to serve API endpoints

import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mailRouter } from './mail/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Mail API
app.use('/api', mailRouter);

app.get('/', (req, res) => {
  res.send('TickerTracker backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
