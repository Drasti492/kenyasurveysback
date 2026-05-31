const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, required: true, trim: true },
    pin: { type: String, required: true, select: false },
    name: { type: String, default: "" },
    county: { type: String, default: "" },
    occupation: { type: String, default: "" },
    education: { type: String, default: "" },
    balance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    welcomeBonusApplied: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    activated: { type: Boolean, default: false },
    activationPhone: { type: String, default: "" },
    forceVerified: { type: Boolean, default: false },
    completedQuestions: [{ type: Number }],
    currentPage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SurveyUser", schema);