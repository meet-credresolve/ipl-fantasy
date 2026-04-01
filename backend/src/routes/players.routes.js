const { Router } = require('express');
const { body } = require('express-validator');
const { getPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer } = require('../controllers/players.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

const router = Router();

router.use(authenticate); // all player routes require login

router.get('/', getPlayers);
router.get('/:id', getPlayerById);

router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty(),
    body('franchise').notEmpty(),
    body('role').isIn(['WK', 'BAT', 'AR', 'BOWL']),
    body('credits').isFloat({ min: 5, max: 15 }),
  ],
  createPlayer
);

router.put('/:id', requireAdmin, updatePlayer);
router.delete('/:id', requireAdmin, deletePlayer);

module.exports = router;
