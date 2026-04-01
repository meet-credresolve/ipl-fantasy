const { validationResult } = require('express-validator');
const Player = require('../models/Player.model');

// GET /api/players?role=WK&franchise=CSK&search=kohli
const getPlayers = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.franchise) filter.franchise = req.query.franchise;
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const players = await Player.find(filter).sort({ franchise: 1, credits: -1 });
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/players/:id
const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/players  (admin)
const createPlayer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/players/:id  (admin)
const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/players/:id  (admin) — soft delete via isActive flag
const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPlayers, getPlayerById, createPlayer, updatePlayer, deletePlayer };
