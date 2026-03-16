const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireAuth } = require('../middleware/auth');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

// GET /dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, '../views/dashboard.html'), 'utf8');
  html = html.replace(/\{\{USER_NAME\}\}/g, req.session.user.name);
  html = html.replace(/\{\{USER_ROLE\}\}/g, req.session.user.role);
  res.send(html);
});

// GET /api/stats
router.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    const totalVolunteers = volunteers.reduce((sum, g) => sum + g.participantCount, 0);

    const allPre = [], allPost = [];
    volunteers.forEach(g => {
      if (g.preIntervention) {
        const v = g.preIntervention;
        [v.hypertension, v.dyslipidemia, v.fattyLiver, 
         v.ecgAbnormal, v.kidneyDisease, v.liverDisease]
          .filter(x => x != null).forEach(x => allPre.push(x));
      }
      if (g.postIntervention) {
        const v = g.postIntervention;
        [v.hypertension, v.dyslipidemia, v.fattyLiver, 
         v.ecgAbnormal, v.kidneyDisease, v.liverDisease]
          .filter(x => x != null).forEach(x => allPost.push(x));
      }
    });

    const avg = arr => arr.length ? 
      (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
    const preRate = parseFloat(avg(allPre));
    const postRate = parseFloat(avg(allPost));

    res.json({
      totalVolunteers,
      groups: volunteers.length,
      preInterventionRate: preRate,
      postInterventionRate: postRate,
      improvement: parseFloat((preRate - postRate).toFixed(1))
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// GET /api/disease-data
router.get('/api/disease-data', requireAuth, async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    const fields = ['hypertension', 'dyslipidemia', 'fattyLiver', 
                    'ecgAbnormal', 'kidneyDisease', 'liverDisease'];
    const labels = ['Hypertension', 'Dyslipidemia', 'Fatty Liver', 
                    'ECG Abnormal', 'Kidney Disease', 'Liver Disease'];

    const avgField = (phase, field) => {
      const vals = volunteers.map(g => g[phase]?.[field]).filter(v => v != null);
      return vals.length ? 
        parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
    };

    res.json({
      diseases: labels,
      before: fields.map(f => avgField('preIntervention', f)),
      after: fields.map(f => avgField('postIntervention', f))
    });
  } catch (err) {
    console.error('Disease data error:', err);
    res.status(500).json({ error: 'Failed to load disease data' });
  }
});

// GET /api/volunteers
router.get('/api/volunteers', requireAuth, async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort('groupNumber');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load volunteers' });
  }
});

// GET /api/users (admin only)
router.get('/api/users', requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'Administrator') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

module.exports = router;