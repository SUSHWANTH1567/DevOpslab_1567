require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/health_dashboard';

// ─── CONNECT TO MONGODB ───────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false
  }
}));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect(req.session.user ? '/dashboard' : '/login');
});

// auth.js handles: /login, /register, /logout
app.use('/', require('./routes/auth'));

// dashboard.js handles: /dashboard
app.use('/', require('./routes/dashboard'));

// ─── 404 HANDLER ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <div style="font-family:sans-serif;text-align:center;padding:80px;background:#0f172a;color:#f1f5f9;min-height:100vh">
      <h1 style="font-size:48px;margin-bottom:16px">404</h1>
      <p style="color:#94a3b8;margin-bottom:24px">Page not found</p>
      <a href="/" style="color:#0d9488">Back to Home</a>
    </div>
  `);
});

// ─── START SERVER ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏥  HealthSync: Intelligent Cloud Health Monitor');
  console.log(`👉  http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌  First time? Run: node seed.js');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});