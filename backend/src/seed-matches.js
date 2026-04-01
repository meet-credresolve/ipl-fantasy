/**
 * Seed script: populates the matches collection with the full IPL 2026 schedule.
 * Source: TATA IPL 2026 Season Schedule.pdf (70 league matches)
 * Run once: node src/seed-matches.js
 * Safe to re-run — skips matches that already exist for the same date + teams.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./models/Match.model');

// Helper: convert "28-MAR-26" + "7:00 PM" to a Date in IST (UTC+5:30)
function toIST(dateStr, timeStr) {
  const months = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
  const [day, mon, yr] = dateStr.split('-');
  const year = 2000 + parseInt(yr);
  const month = months[mon];

  let [hm, ampm] = timeStr.split(' ');
  let [h, m] = hm.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  // Create date in IST, then convert to UTC by subtracting 5:30
  const utcMs = Date.UTC(year, month, parseInt(day), h - 5, m - 30);
  return new Date(utcMs);
}

const MATCHES = [
  // ── Page 1: Matches 1–35 (28 Mar – 25 Apr 2026) ───────────────────────
  { matchNo: 1,  date: '28-MAR-26', time: '7:00 PM', team1: 'SRH', team2: 'RCB', venue: 'Bengaluru' },
  { matchNo: 2,  date: '29-MAR-26', time: '7:00 PM', team1: 'KKR', team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 3,  date: '30-MAR-26', time: '7:00 PM', team1: 'CSK', team2: 'RR',  venue: 'Guwahati' },
  { matchNo: 4,  date: '31-MAR-26', time: '7:00 PM', team1: 'GT',  team2: 'PBKS', venue: 'New Chandigarh' },
  { matchNo: 5,  date: '01-APR-26', time: '7:00 PM', team1: 'DC',  team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 6,  date: '02-APR-26', time: '7:00 PM', team1: 'SRH', team2: 'KKR', venue: 'Kolkata' },
  { matchNo: 7,  date: '03-APR-26', time: '7:00 PM', team1: 'PBKS', team2: 'CSK', venue: 'Chennai' },
  { matchNo: 8,  date: '04-APR-26', time: '3:00 PM', team1: 'MI',  team2: 'DC',  venue: 'Delhi' },
  { matchNo: 9,  date: '04-APR-26', time: '7:00 PM', team1: 'RR',  team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 10, date: '05-APR-26', time: '3:00 PM', team1: 'LSG', team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 11, date: '05-APR-26', time: '7:00 PM', team1: 'CSK', team2: 'RCB', venue: 'Bengaluru' },
  { matchNo: 12, date: '06-APR-26', time: '7:00 PM', team1: 'PBKS', team2: 'KKR', venue: 'Kolkata' },
  { matchNo: 13, date: '07-APR-26', time: '7:00 PM', team1: 'MI',  team2: 'RR',  venue: 'Guwahati' },
  { matchNo: 14, date: '08-APR-26', time: '7:00 PM', team1: 'GT',  team2: 'DC',  venue: 'Delhi' },
  { matchNo: 15, date: '09-APR-26', time: '7:00 PM', team1: 'LSG', team2: 'KKR', venue: 'Kolkata' },
  { matchNo: 16, date: '10-APR-26', time: '7:00 PM', team1: 'RCB', team2: 'RR',  venue: 'Guwahati' },
  { matchNo: 17, date: '11-APR-26', time: '3:00 PM', team1: 'SRH', team2: 'PBKS', venue: 'New Chandigarh' },
  { matchNo: 18, date: '11-APR-26', time: '7:00 PM', team1: 'DC',  team2: 'CSK', venue: 'Chennai' },
  { matchNo: 19, date: '12-APR-26', time: '3:00 PM', team1: 'GT',  team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 20, date: '12-APR-26', time: '7:00 PM', team1: 'RCB', team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 21, date: '13-APR-26', time: '7:00 PM', team1: 'RR',  team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 22, date: '14-APR-26', time: '7:00 PM', team1: 'KKR', team2: 'CSK', venue: 'Chennai' },
  { matchNo: 23, date: '15-APR-26', time: '7:00 PM', team1: 'LSG', team2: 'RCB', venue: 'Bengaluru' },
  { matchNo: 24, date: '16-APR-26', time: '7:00 PM', team1: 'PBKS', team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 25, date: '17-APR-26', time: '7:00 PM', team1: 'KKR', team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 26, date: '18-APR-26', time: '3:00 PM', team1: 'DC',  team2: 'RCB', venue: 'Bengaluru' },
  { matchNo: 27, date: '18-APR-26', time: '7:00 PM', team1: 'CSK', team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 28, date: '19-APR-26', time: '3:00 PM', team1: 'RR',  team2: 'KKR', venue: 'Kolkata' },
  { matchNo: 29, date: '19-APR-26', time: '7:00 PM', team1: 'LSG', team2: 'PBKS', venue: 'New Chandigarh' },
  { matchNo: 30, date: '20-APR-26', time: '7:00 PM', team1: 'MI',  team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 31, date: '21-APR-26', time: '7:00 PM', team1: 'DC',  team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 32, date: '22-APR-26', time: '7:00 PM', team1: 'RR',  team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 33, date: '23-APR-26', time: '7:00 PM', team1: 'CSK', team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 34, date: '24-APR-26', time: '7:00 PM', team1: 'GT',  team2: 'RCB', venue: 'Bengaluru' },
  { matchNo: 35, date: '25-APR-26', time: '3:00 PM', team1: 'PBKS', team2: 'DC',  venue: 'Delhi' },

  // ── Page 2: Matches 36–70 (25 Apr – 24 May 2026) ──────────────────────
  { matchNo: 36, date: '25-APR-26', time: '7:00 PM', team1: 'SRH', team2: 'RR',  venue: 'Jaipur' },
  { matchNo: 37, date: '26-APR-26', time: '3:00 PM', team1: 'CSK', team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 38, date: '26-APR-26', time: '7:00 PM', team1: 'KKR', team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 39, date: '27-APR-26', time: '7:00 PM', team1: 'RCB', team2: 'DC',  venue: 'Delhi' },
  { matchNo: 40, date: '28-APR-26', time: '7:00 PM', team1: 'RR',  team2: 'PBKS', venue: 'New Chandigarh' },
  { matchNo: 41, date: '29-APR-26', time: '7:00 PM', team1: 'SRH', team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 42, date: '30-APR-26', time: '7:00 PM', team1: 'RCB', team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 43, date: '01-MAY-26', time: '7:00 PM', team1: 'DC',  team2: 'RR',  venue: 'Jaipur' },
  { matchNo: 44, date: '02-MAY-26', time: '7:00 PM', team1: 'MI',  team2: 'CSK', venue: 'Chennai' },
  { matchNo: 45, date: '03-MAY-26', time: '3:00 PM', team1: 'KKR', team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 46, date: '03-MAY-26', time: '7:00 PM', team1: 'PBKS', team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 47, date: '04-MAY-26', time: '7:00 PM', team1: 'LSG', team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 48, date: '05-MAY-26', time: '7:00 PM', team1: 'CSK', team2: 'DC',  venue: 'Delhi' },
  { matchNo: 49, date: '06-MAY-26', time: '7:00 PM', team1: 'PBKS', team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 50, date: '07-MAY-26', time: '7:00 PM', team1: 'RCB', team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 51, date: '08-MAY-26', time: '7:00 PM', team1: 'KKR', team2: 'DC',  venue: 'Delhi' },
  { matchNo: 52, date: '09-MAY-26', time: '7:00 PM', team1: 'GT',  team2: 'RR',  venue: 'Jaipur' },
  { matchNo: 53, date: '10-MAY-26', time: '3:00 PM', team1: 'LSG', team2: 'CSK', venue: 'Chennai' },
  { matchNo: 54, date: '10-MAY-26', time: '7:00 PM', team1: 'MI',  team2: 'RCB', venue: 'Raipur' },
  { matchNo: 55, date: '11-MAY-26', time: '7:00 PM', team1: 'DC',  team2: 'PBKS', venue: 'Dharamshala' },
  { matchNo: 56, date: '12-MAY-26', time: '7:00 PM', team1: 'SRH', team2: 'GT',  venue: 'Ahmedabad' },
  { matchNo: 57, date: '13-MAY-26', time: '7:00 PM', team1: 'KKR', team2: 'RCB', venue: 'Raipur' },
  { matchNo: 58, date: '14-MAY-26', time: '7:00 PM', team1: 'MI',  team2: 'PBKS', venue: 'Dharamshala' },
  { matchNo: 59, date: '15-MAY-26', time: '7:00 PM', team1: 'CSK', team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 60, date: '16-MAY-26', time: '7:00 PM', team1: 'GT',  team2: 'KKR', venue: 'Kolkata' },
  { matchNo: 61, date: '17-MAY-26', time: '3:00 PM', team1: 'RCB', team2: 'PBKS', venue: 'Dharamshala' },
  { matchNo: 62, date: '17-MAY-26', time: '7:00 PM', team1: 'RR',  team2: 'DC',  venue: 'Delhi' },
  { matchNo: 63, date: '18-MAY-26', time: '7:00 PM', team1: 'SRH', team2: 'CSK', venue: 'Chennai' },
  { matchNo: 64, date: '19-MAY-26', time: '7:00 PM', team1: 'LSG', team2: 'RR',  venue: 'Jaipur' },
  { matchNo: 65, date: '20-MAY-26', time: '7:00 PM', team1: 'MI',  team2: 'KKR', venue: 'Kolkata' },
  { matchNo: 66, date: '21-MAY-26', time: '7:00 PM', team1: 'GT',  team2: 'CSK', venue: 'Chennai' },
  { matchNo: 67, date: '22-MAY-26', time: '7:00 PM', team1: 'RCB', team2: 'SRH', venue: 'Hyderabad' },
  { matchNo: 68, date: '23-MAY-26', time: '7:00 PM', team1: 'PBKS', team2: 'LSG', venue: 'Lucknow' },
  { matchNo: 69, date: '24-MAY-26', time: '3:00 PM', team1: 'RR',  team2: 'MI',  venue: 'Mumbai' },
  { matchNo: 70, date: '24-MAY-26', time: '7:00 PM', team1: 'DC',  team2: 'KKR', venue: 'Kolkata' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let created = 0;
  let skipped = 0;

  for (const m of MATCHES) {
    const scheduledAt = toIST(m.date, m.time);

    // Skip if a match already exists with same teams and date
    const exists = await Match.findOne({
      team1: m.team1,
      team2: m.team2,
      scheduledAt,
    });

    if (!exists) {
      await Match.create({
        team1: m.team1,
        team2: m.team2,
        venue: m.venue,
        scheduledAt,
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Seeded ${created} matches (${skipped} already existed)`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
