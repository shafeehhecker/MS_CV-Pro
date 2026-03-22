require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const cvRoutes = require('./routes/cv');
const atsRoutes = require('./routes/ats');
const exportRoutes = require('./routes/export');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload dirs exist
['uploads/photos', 'exports'].forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/exports', express.static(path.join(__dirname, '..', 'exports')));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`MS CV Pro API running on port ${PORT}`));
