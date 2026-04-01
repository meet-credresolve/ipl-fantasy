/**
 * Fantasy Points Calculation Engine
 * Implements all rules from REQUIREMENTS.MD Section 3.
 *
 * @param {Object} perf  - PlayerPerformance document (plain object or Mongoose doc)
 * @param {string} role  - Player role: 'WK' | 'BAT' | 'AR' | 'BOWL'
 * @returns {number}     - Total fantasy points (not yet multiplied for C/VC)
 */
function calculateFantasyPoints(perf, role) {
  let points = 0;

  // ─── 3.1 Batting Points ────────────────────────────────────────────────────
  if (perf.didBat) {
    points += perf.runs;                              // +1 per run
    points += perf.fours;                             // +1 per four
    points += perf.sixes * 2;                         // +2 per six

    // Milestone bonuses
    if (perf.runs >= 100) points += 16;               // century
    else if (perf.runs >= 50) points += 8;            // half-century

    // Duck penalty (not for pure bowlers)
    if (perf.isDismissed && perf.runs === 0 && role !== 'BOWL') {
      points -= 2;
    }

    // Batting Strike Rate modifier (min 10 balls faced)
    if (perf.ballsFaced >= 10) {
      const sr = (perf.runs / perf.ballsFaced) * 100;
      if (sr > 170) points += 6;
      else if (sr > 150) points += 4;
      else if (sr >= 130) points += 2;
      else if (sr <= 70 && sr >= 60) points -= 2;
      else if (sr < 60 && sr >= 50) points -= 4;
      else if (sr < 50) points -= 6;
    }
  }

  // ─── 3.2 Bowling Points ────────────────────────────────────────────────────
  if (perf.oversBowled > 0) {
    points += perf.wickets * 25;                      // +25 per wicket (no run-outs)
    points += perf.lbwBowledWickets * 8;              // +8 bonus per LBW/Bowled wicket
    points += perf.maidens * 12;                      // +12 per maiden over

    // Haul milestones
    if (perf.wickets >= 5) points += 16;
    else if (perf.wickets >= 4) points += 8;

    // Bowling Economy Rate modifier (min 2 overs)
    if (perf.oversBowled >= 2) {
      const economy = perf.runsConceded / perf.oversBowled;
      if (economy < 5) points += 6;
      else if (economy < 6) points += 4;
      else if (economy <= 7) points += 2;
      else if (economy >= 10 && economy <= 11) points -= 2;
      else if (economy > 11 && economy <= 12) points -= 4;
      else if (economy > 12) points -= 6;
    }
  }

  // ─── 3.3 Fielding Points ──────────────────────────────────────────────────
  points += perf.catches * 8;                         // +8 per catch

  // Bonus for 3+ catches in a single match
  if (perf.catches >= 3) points += 4;

  points += perf.stumpings * 12;                      // +12 per stumping
  points += perf.runOutDirect * 12;                   // +12 direct run-out
  points += perf.runOutIndirect * 6;                  // +6 indirect run-out (throw or catch)

  return points;
}

/**
 * Apply captain (2x) or vice-captain (1.5x) multiplier.
 */
function applyMultiplier(points, isCaptain, isViceCaptain) {
  if (isCaptain) return points * 2;
  if (isViceCaptain) return points * 1.5;
  return points;
}

module.exports = { calculateFantasyPoints, applyMultiplier };
