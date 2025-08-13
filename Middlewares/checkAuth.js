const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
  const token = req.cookies.token;
  // console.log("Token from cookie(checkAuth):", token); // ✅ See if token is present
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if(!user) return res.status(401).json({ message: 'Not authenticated' });
    req.user = user; // attach user info to req
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}


module.exports = {
    checkAuth,
}