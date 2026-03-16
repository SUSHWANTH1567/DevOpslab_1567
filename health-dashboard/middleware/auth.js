// Middleware: redirect to login if not authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Middleware: redirect to dashboard if already logged in
function redirectIfLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireAuth, redirectIfLoggedIn };