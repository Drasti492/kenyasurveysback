const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "SurveyUser", required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, unique: true, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    isForceVerification: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivationPayment", schema);