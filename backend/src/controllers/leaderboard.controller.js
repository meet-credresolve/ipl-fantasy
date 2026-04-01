const FantasyTeam = require('../models/FantasyTeam.model');
const User = require('../models/User.model');

// GET /api/leaderboard/match/:matchId
// Ranks all users by totalPoints for that specific match.
const getMatchLeaderboard = async (req, res) => {
  try {
    const teams = await FantasyTeam.find({ matchId: req.params.matchId })
      .populate('userId', 'name')
      .sort({ totalPoints: -1 });

    const leaderboard = teams.map((t, idx) => ({
      rank: idx + 1,
      userId: t.userId._id,
      userName: t.userId.name,
      totalPoints: t.totalPoints,
      teamId: t._id,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/leaderboard/season
// Aggregates points across all completed matches (not abandoned).
const getSeasonLeaderboard = async (req, res) => {
  try {
    const aggregate = await FantasyTeam.aggregate([
      // Only count teams from completed matches
      {
        $lookup: {
          from: 'matches',
          localField: 'matchId',
          foreignField: '_id',
          as: 'match',
        },
      },
      { $unwind: '$match' },
      { $match: { 'match.status': 'completed' } },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$totalPoints' },
          matchesPlayed: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$user.name',
          totalPoints: 1,
          matchesPlayed: 1,
        },
      },
    ]);

    const leaderboard = aggregate.map((entry, idx) => ({ rank: idx + 1, ...entry }));
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMatchLeaderboard, getSeasonLeaderboard };
