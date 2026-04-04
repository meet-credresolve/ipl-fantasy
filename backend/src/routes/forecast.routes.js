const { Router } = require('express');
const { getLeaderboardForecast } = require('../controllers/forecast.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();
router.use(authenticate);
router.get('/:matchId', getLeaderboardForecast);

module.exports = router;
