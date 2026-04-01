/**
 * Must be used AFTER authenticate middleware.
 * Rejects the request if the logged-in user is not an admin.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { requireAdmin };
