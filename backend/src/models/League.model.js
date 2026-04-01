const mongoose = require('mongoose');
const crypto = require('crypto');

const leagueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    inviteCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(3).toString('hex').toUpperCase(), // e.g. "A3F9C1"
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    season: { type: String, default: 'IPL_2026' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('League', leagueSchema);
