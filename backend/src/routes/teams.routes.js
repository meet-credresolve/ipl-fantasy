const { Router } = require('express');
const { upsertTeam, getMyTeam, getAllTeams } = require('../controllers/teams.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.post('/', upsertTeam);
router.get('/my/:matchId', getMyTeam);
router.get('/all/:matchId', getAllTeams);

module.exports = router;
