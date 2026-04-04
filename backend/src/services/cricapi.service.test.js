const test = require('node:test');
const assert = require('node:assert/strict');

// mapScorecardToPerformances and parseDismissal are not individually exported,
// so we test via the public function. We need to require it and build a fake
// CricAPI response that exercises the fielding name resolution.
const { mapScorecardToPerformances } = require('./cricapi.service');

function buildFakeScorecard(batting1, bowling1, batting2, bowling2) {
  return {
    data: {
      scorecard: [
        { batting: batting1, bowling: bowling2 },
        { batting: batting2, bowling: bowling1 },
      ],
      matchEnded: true,
      status: 'Match over',
    },
  };
}

test('catches from partial name merge into full-name batting entry', () => {
  // Jasprit Bumrah bowled and also took a catch.
  // The dismissal text uses just "Bumrah" but bowling uses "Jasprit Bumrah".
  const raw = buildFakeScorecard(
    // Innings 1 batting — one batsman caught by "Bumrah"
    [
      { batsman: { name: 'Virat Kohli' }, r: 45, b: 30, '4s': 5, '6s': 1, dismissal: 'c Bumrah b Siraj' },
      { batsman: { name: 'KL Rahul' }, r: 20, b: 15, '4s': 2, '6s': 0, dismissal: 'not out' },
    ],
    // Innings 1 bowling — Bumrah with full name
    [
      { bowler: { name: 'Jasprit Bumrah' }, o: 4, r: 25, w: 1, m: 0 },
      { bowler: { name: 'Mohammed Siraj' }, o: 4, r: 30, w: 1, m: 0 },
    ],
    // Innings 2 batting
    [
      { batsman: { name: 'Jasprit Bumrah' }, r: 2, b: 5, '4s': 0, '6s': 0, dismissal: 'b Chahal' },
    ],
    // Innings 2 bowling
    [
      { bowler: { name: 'Yuzvendra Chahal' }, o: 4, r: 28, w: 1, m: 0 },
    ]
  );

  const { performances } = mapScorecardToPerformances(raw);
  const bumrah = performances.find((p) => p.cricApiName === 'Jasprit Bumrah');
  const orphan = performances.find((p) => p.cricApiName === 'Bumrah');

  // Catch should merge into full-name entry, no orphan
  assert.ok(bumrah, 'Jasprit Bumrah entry should exist');
  assert.equal(bumrah.catches, 1, 'catch should be credited to full-name entry');
  assert.equal(orphan, undefined, 'no orphan "Bumrah" entry should exist');
});

test('stumping from partial keeper name merges into full-name entry', () => {
  const raw = buildFakeScorecard(
    [
      { batsman: { name: 'Rohit Sharma' }, r: 10, b: 8, '4s': 1, '6s': 0, dismissal: 'st Dhoni b Jadeja' },
    ],
    [
      { bowler: { name: 'Ravindra Jadeja' }, o: 4, r: 22, w: 1, m: 0 },
    ],
    [
      { batsman: { name: 'MS Dhoni' }, r: 30, b: 20, '4s': 3, '6s': 1, dismissal: 'not out' },
    ],
    []
  );

  const { performances } = mapScorecardToPerformances(raw);
  const dhoni = performances.find((p) => p.cricApiName === 'MS Dhoni');
  const orphan = performances.find((p) => p.cricApiName === 'Dhoni');

  assert.ok(dhoni, 'MS Dhoni entry should exist');
  assert.equal(dhoni.stumpings, 1, 'stumping should merge into full-name entry');
  assert.equal(orphan, undefined, 'no orphan "Dhoni" entry');
});

test('run-out fielder name resolves to full name', () => {
  const raw = buildFakeScorecard(
    [
      { batsman: { name: 'Shubman Gill' }, r: 5, b: 10, '4s': 0, '6s': 0, dismissal: 'run out (Jadeja)' },
    ],
    [],
    [
      { batsman: { name: 'Ravindra Jadeja' }, r: 15, b: 12, '4s': 2, '6s': 0, dismissal: 'not out' },
    ],
    []
  );

  const { performances } = mapScorecardToPerformances(raw);
  const jadeja = performances.find((p) => p.cricApiName === 'Ravindra Jadeja');
  const orphan = performances.find((p) => p.cricApiName === 'Jadeja');

  assert.ok(jadeja, 'Ravindra Jadeja entry should exist');
  assert.equal(jadeja.runOutDirect, 1, 'direct run-out should merge');
  assert.equal(orphan, undefined, 'no orphan');
});

test('ambiguous last name creates separate entry (no wrong merge)', () => {
  // Two Sharmas — partial "Sharma" should NOT merge into either
  const raw = buildFakeScorecard(
    [
      { batsman: { name: 'KL Rahul' }, r: 10, b: 8, '4s': 1, '6s': 0, dismissal: 'c Sharma b Bumrah' },
    ],
    [
      { bowler: { name: 'Jasprit Bumrah' }, o: 4, r: 20, w: 1, m: 0 },
    ],
    [
      { batsman: { name: 'Rohit Sharma' }, r: 40, b: 30, '4s': 4, '6s': 2, dismissal: 'not out' },
      { batsman: { name: 'Ishant Sharma' }, r: 5, b: 10, '4s': 0, '6s': 0, dismissal: 'not out' },
    ],
    []
  );

  const { performances } = mapScorecardToPerformances(raw);
  const orphan = performances.find((p) => p.cricApiName === 'Sharma');

  // With two Sharmas, partial "Sharma" can't resolve — creates its own entry
  assert.ok(orphan, 'ambiguous "Sharma" should remain as separate entry');
  assert.equal(orphan.catches, 1);
});

test('c & b pattern credits both catch and bowling wicket to same player', () => {
  const raw = buildFakeScorecard(
    [
      { batsman: { name: 'AB de Villiers' }, r: 15, b: 10, '4s': 2, '6s': 0, dismissal: 'c & b Rashid Khan' },
    ],
    [],
    [],
    [
      { bowler: { name: 'Rashid Khan' }, o: 4, r: 22, w: 1, m: 0 },
    ]
  );

  const { performances } = mapScorecardToPerformances(raw);
  const rashid = performances.find((p) => p.cricApiName === 'Rashid Khan');

  assert.ok(rashid, 'Rashid Khan entry should exist');
  assert.equal(rashid.catches, 1, 'c&b should credit catch');
  assert.equal(rashid.wickets, 1, 'bowling wicket should remain');
});
