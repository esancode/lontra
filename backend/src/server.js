import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import rateLimiter from './middleware/rateLimiter.js';
import { identify } from './middleware/identify.js';
import cors from 'cors';
import path from 'path';

import notesRoutes from './routes/notesRoutes.js';
import boxRoutes from './routes/boxRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import quicknoteRoutes from './routes/quicknoteRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

app.use(express.json());
app.use(rateLimiter);

app.use('/api/notes', identify, notesRoutes);
app.use('/api/boxes', identify, boxRoutes);
app.use('/api/search', identify, searchRoutes);
app.use('/api/quick-note', identify, quicknoteRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server started on PORT:', PORT);
  });
});
