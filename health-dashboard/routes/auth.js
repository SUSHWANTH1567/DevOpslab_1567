const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { redirectIfLoggedIn } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// GET /login
router.get('/login', redirectIfLoggedIn, (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, '../views/login.html'), 'utf8');
  res.send(html);
});

// POST /login — authenticate against MongoDB
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user || !user.isActive) {
      const html = fs.readFileSync(path.join(__dirname, '../views/login.html'), 'utf8');
      return res.send(html.replace('<!--ERROR-->', '<div class="error-msg">❌ Invalid username or password</div>'));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const html = fs.readFileSync(path.join(__dirname, '../views/login.html'), 'utf8');
      return res.send(html.replace('<!--ERROR-->', '<div class="error-msg">❌ Invalid username or password</div>'));
    }

    user.lastLogin = new Date();
    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    };

    console.log(`✅ User logged in: ${user.username} (${user.role})`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    const html = fs.readFileSync(path.join(__dirname, '../views/login.html'), 'utf8');
    res.send(html.replace('<!--ERROR-->', '<div class="error-msg">⚠️ Server error. Please try again.</div>'));
  }
});

// GET /register
router.get('/register', redirectIfLoggedIn, (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, '../views/register.html'), 'utf8');
  res.send(html);
});

// POST /register — save new user to MongoDB
router.post('/register', async (req, res) => {
  const { firstname, lastname, email, username, password, confirmpassword, role } = req.body;

  const sendError = (msg) => {
    const html = fs.readFileSync(path.join(__dirname, '../views/register.html'), 'utf8');
    return res.send(html.replace('<!--ERROR-->', `<div class="error-msg">❌ ${msg}</div>`));
  };

  if (!firstname || !lastname || !email || !username || !password || !role) return sendError('Please fill in all required fields');
  if (password !== confirmpassword) return sendError('Passwords do not match');
  if (password.length < 6) return sendError('Password must be at least 6 characters');
  if (username.length < 3) return sendError('Username must be at least 3 characters');

  try {
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) return sendError('Username already taken. Please choose another.');

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      const html = fs.readFileSync(path.join(__dirname, '../views/register.html'), 'utf8');
      return res.send(html.replace('<!--ERROR-->', `<div class="error-msg">❌ Email already registered. <a href="/login" style="color:#6ee7b7">Sign in instead →</a></div>`));
    }

    const newUser = new User({
      name: `${firstname.trim()} ${lastname.trim()}`,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    });

    await newUser.save();
    console.log(`🆕 New user registered: ${newUser.username} (${newUser.role})`);

    const html = fs.readFileSync(path.join(__dirname, '../views/register.html'), 'utf8');
    return res.send(html.replace('<!--SUCCESS-->', `
      <div class="success-msg">
        ✅ Account created! Welcome, ${firstname}!
        <a href="/login" style="color:#6ee7b7; font-weight:600; margin-left:6px">Sign in now →</a>
      </div>
    `));

  } catch (err) {
    console.error('Register error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return sendError(messages);
    }
    return sendError('Something went wrong. Please try again.');
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  const username = req.session.user?.username || 'unknown';
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    console.log(`👋 User logged out: ${username}`);
    res.redirect('/login');
  });
});

module.exports = router;