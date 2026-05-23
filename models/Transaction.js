const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyUser", required: true },
    type: {
      type: String,
      enum: ["survey_reward", "withdrawal", "activation", "welcome_bonus"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
    balanceAfter: { type: Number },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", schema);