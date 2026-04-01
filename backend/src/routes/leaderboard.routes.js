const { Router } = require('express');
const { getMatchLeaderboard, getSeasonLeaderboard } = require('../controllers/leaderboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/match/:matchId', getMatchLeaderboard);
router.get('/season', getSeasonLeaderboard);

module.exports = router;
