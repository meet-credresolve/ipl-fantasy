const Match = require('../models/Match.model');
const Player = require('../models/Player.model');
const FantasyTeam = require('../models/FantasyTeam.model');
const PlayerPerformance = require('../models/PlayerPerformance.model');
const User = require('../models/User.model');
const { getActiveLeagueMemberIds } = require('./league-members.service');
const { calculateFantasyPoints, applyMultiplier } = require('./scoring.service');

// Role-based default point estimates (T20 heuristics calibrated to scoring rules)
const ROLE_DEFAULTS = {
  BAT:  { batting: 30, bowling: 0,  fielding: 4 },
  WK:   { batting: 28, bowling: 0,  fielding: 8 },
  AR:   { batting: 22, bowling: 20, fielding: 4 },
  BOWL: { batting: 5,  bowling: 30, fielding: 4 },
};

// Average innings length by role (balls faced)
const AVG_BALLS = { BAT: 25, WK: 25, AR: 18, BOWL: 8 };

/**
 * Project a player's final fantasy points based on current performance.
 * Returns the projected total fantasy points for this player.
 */
function projectPlayerPoints(perf, role) {
  if (!perf) {
    // No performance record — use role defaults
    const d = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.BAT;
    return d.batting + d.bowling + d.fielding;
  }

  // Build projected stats starting from actuals
  const projected = {
    runs: perf.runs || 0,
    ballsFaced: perf.ballsFaced || 0,
    fours: perf.fours || 0,
    sixes: perf.sixes || 0,
    isDismissed: perf.isDismissed || false,
    didBat: perf.didBat || false,
    oversBowled: perf.oversBowled || 0,
    runsConceded: perf.runsConceded || 0,
    wickets: perf.wickets || 0,
    maidens: perf.maidens || 0,
    lbwBowledWickets: perf.lbwBowledWickets || 0,
    catches: perf.catches || 0,
    stumpings: perf.stumpings || 0,
    runOutDirect: perf.runOutDirect || 0,
    runOutIndirect: perf.runOutIndirect || 0,
  };

  // ── Batting projection ──
  if (projected.didBat && !projected.isDismissed) {
    // Currently batting — project remaining based on current SR
    const currentSR = projected.ballsFaced > 0
      ? (projected.runs / projected.ballsFaced) * 100
      : 130;
    const avgBalls = AVG_BALLS[role] || 20;
    const remaining = Math.max(0, avgBalls - projected.ballsFaced);
    const addRuns = Math.round(remaining * currentSR / 100);

    projected.runs += addRuns;
    projected.ballsFaced += remaining;
    projected.fours += Math.round(addRuns / 15);
    projected.sixes += Math.round(addRuns / 25);
    projected.isDismissed = true; // assume eventual dismissal
  } else if (!projected.didBat) {
    // Hasn't batted yet — add role default batting points separately
    const d = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.BAT;
    // Create a batting-only perf to calculate separately
    const batPerf = {
      runs: Math.round(d.batting * 0.8), // ~80% of default comes from runs
      ballsFaced: AVG_BALLS[role] || 20,
      fours: Math.round(d.batting * 0.8 / 15),
      sixes: Math.round(d.batting * 0.8 / 30),
      isDismissed: true,
      didBat: true,
    };
    const batPoints = calculateFantasyPoints(batPerf, role);
    // For not-yet-batted, return default + bowling projection + fielding actual
    const bowlPoints = projectBowlingOnly(projected, role);
    return batPoints + bowlPoints + (projected.catches * 8) + (projected.stumpings * 12) +
      (projected.runOutDirect * 12) + (projected.runOutIndirect * 6) +
      (projected.catches >= 3 ? 4 : 0);
  }

  // ── Bowling projection ──
  if (projected.oversBowled > 0 && projected.oversBowled < 4 &&
      ['BOWL', 'AR'].includes(role)) {
    // Still bowling — project to 4 overs at current economy
    const econ = projected.runsConceded / projected.oversBowled;
    const remaining = 4 - projected.oversBowled;
    projected.oversBowled = 4;
    projected.runsConceded += Math.round(econ * remaining);
    // Project additional wickets (conservative: 70% of current rate)
    const wicketRate = projected.wickets / projected.oversBowled;
    projected.wickets += Math.round(wicketRate * remaining * 0.7);
  } else if (projected.oversBowled === 0 && ['BOWL', 'AR'].includes(role)) {
    // Hasn't bowled yet — add default bowling estimate
    const d = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.BOWL;
    projected.oversBowled = 4;
    projected.runsConceded = 32; // ~8 economy
    projected.wickets = role === 'BOWL' ? 1 : 1;
    projected.maidens = 0;
  }

  // Add small fielding estimate for remaining match
  projected.catches += 0; // keep actual, don't inflate

  return calculateFantasyPoints(projected, role);
}

/**
 * Calculate bowling-only points for a projected perf.
 */
function projectBowlingOnly(perf, role) {
  if (!['BOWL', 'AR'].includes(role)) return 0;

  const bowlPerf = {
    oversBowled: perf.oversBowled || 0,
    runsConceded: perf.runsConceded || 0,
    wickets: perf.wickets || 0,
    maidens: perf.maidens || 0,
    lbwBowledWickets: perf.lbwBowledWickets || 0,
  };

  if (bowlPerf.oversBowled === 0) {
    // Use defaults
    bowlPerf.oversBowled = 4;
    bowlPerf.runsConceded = 32;
    bowlPerf.wickets = 1;
  } else if (bowlPerf.oversBowled < 4) {
    const econ = bowlPerf.runsConceded / bowlPerf.oversBowled;
    const remaining = 4 - bowlPerf.oversBowled;
    bowlPerf.oversBowled = 4;
    bowlPerf.runsConceded += Math.round(econ * remaining);
    bowlPerf.wickets += Math.round((bowlPerf.wickets / (4 - remaining)) * remaining * 0.7);
  }

  // Calculate just the bowling portion
  return calculateFantasyPoints({ ...bowlPerf, didBat: false }, role) -
    calculateFantasyPoints({ didBat: false }, role);
}

/**
 * Main forecast generator.
 */
async function generateForecast(matchId) {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const activeMemberIds = await getActiveLeagueMemberIds();
  if (activeMemberIds.length === 0) return { matchId, forecast: [], matchProgress: {} };

  // 1. Get all performances for this match
  const perfs = await PlayerPerformance.find({ matchId }).lean();
  const perfByPlayer = {};
  for (const p of perfs) perfByPlayer[String(p.playerId)] = p;

  // 2. Get all players (for role info)
  const allPlayers = await Player.find({ isActive: true }).lean();
  const playerById = {};
  for (const p of allPlayers) playerById[String(p._id)] = p;

  // 3. Get all fantasy teams for this match
  const teams = await FantasyTeam.find({ matchId, userId: { $in: activeMemberIds } })
    .populate('userId', 'name')
    .lean();

  // 4. Get season totals from completed matches
  const seasonAgg = await FantasyTeam.aggregate([
    { $match: { userId: { $in: activeMemberIds } } },
    { $lookup: { from: 'matches', localField: 'matchId', foreignField: '_id', as: 'match' } },
    { $unwind: '$match' },
    { $match: { 'match.status': 'completed' } },
    { $group: { _id: '$userId', totalPoints: { $sum: '$totalPoints' } } },
  ]);
  const seasonTotals = {};
  for (const s of seasonAgg) seasonTotals[String(s._id)] = s.totalPoints;

  // 5. Season ranks (current)
  const seasonSorted = Object.entries(seasonTotals).sort((a, b) => b[1] - a[1]);
  const seasonRanks = {};
  seasonSorted.forEach(([uid, _pts], idx) => { seasonRanks[uid] = idx + 1; });

  // 6. Count completed players for confidence
  const playingXIIds = [
    ...(match.playingXI?.team1 || []).map(String),
    ...(match.playingXI?.team2 || []).map(String),
  ];
  const totalXI = playingXIIds.length || 22;
  let completedCount = 0;
  for (const pid of playingXIIds) {
    const perf = perfByPlayer[pid];
    if (!perf) continue;
    const batDone = perf.didBat && perf.isDismissed;
    const bowlDone = perf.oversBowled >= 4;
    if (batDone || bowlDone) completedCount++;
  }
  const confidence = Math.min(100, Math.round((completedCount / totalXI) * 100));

  // 7. For each team, compute projections
  const forecast = [];
  for (const team of teams) {
    if (!team.userId) continue;
    const uid = String(team.userId._id || team.userId);
    const userName = team.userId.name || 'Unknown';

    let livePoints = 0;
    let projectedMatchPoints = 0;

    for (const playerId of team.players) {
      const pid = String(playerId);
      const player = playerById[pid];
      const role = player?.role || 'BAT';
      const perf = perfByPlayer[pid];

      // Actual live points
      const actualPts = perf ? calculateFantasyPoints(perf, role) : 0;
      const isCaptain = String(team.captain) === pid;
      const isVC = String(team.viceCaptain) === pid;

      livePoints += applyMultiplier(actualPts, isCaptain, isVC);

      // Projected points
      const projPts = projectPlayerPoints(perf, role);
      projectedMatchPoints += applyMultiplier(projPts, isCaptain, isVC);
    }

    livePoints = Math.round(livePoints * 10) / 10;
    projectedMatchPoints = Math.round(projectedMatchPoints * 10) / 10;

    const currentPoints = seasonTotals[uid] || 0;
    const projectedSeasonTotal = Math.round((currentPoints + projectedMatchPoints) * 10) / 10;

    const variance = (1 - confidence / 100) * 0.4;
    const pointRange = {
      min: Math.round(projectedMatchPoints * (1 - variance) * 10) / 10,
      max: Math.round(projectedMatchPoints * (1 + variance) * 10) / 10,
    };

    forecast.push({
      userId: uid,
      userName,
      currentPoints,
      currentSeasonRank: seasonRanks[uid] || activeMemberIds.length,
      livePoints,
      projectedMatchPoints,
      projectedSeasonTotal,
      projectedRank: 0, // assigned after sort
      projectedMatchRank: 0,
      confidence,
      pointRange,
    });
  }

  // 8. Assign ranks
  forecast.sort((a, b) => b.projectedSeasonTotal - a.projectedSeasonTotal);
  forecast.forEach((f, i) => { f.projectedRank = i + 1; });

  const matchSorted = [...forecast].sort((a, b) => b.projectedMatchPoints - a.projectedMatchPoints);
  matchSorted.forEach((f, i) => { f.projectedMatchRank = i + 1; });

  // 9. Match progress
  let oversCompleted = 0;
  for (const perf of perfs) {
    oversCompleted += perf.oversBowled || 0;
  }
  // Each team bowls max 20 overs = 40 total, but we sum from bowling entries
  const totalOvers = 40;
  const inning = oversCompleted <= 20 ? 1 : 2;

  return {
    matchId: String(match._id),
    matchLabel: `${match.team1} vs ${match.team2}`,
    matchStatus: match.status,
    forecast,
    matchProgress: {
      oversCompleted: Math.round(oversCompleted * 10) / 10,
      totalOvers,
      inning,
    },
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { generateForecast };
