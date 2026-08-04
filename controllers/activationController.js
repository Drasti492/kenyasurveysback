const axios = require("axios");
const User = require("../models/User");
const ActivationPayment = require("../models/ActivationPayment");
const Transaction = require("../models/Transaction");

const ACTIVATION_AMOUNT       = 120;
const FORCE_VERIFICATION_AMOUNT = 100;
const STK_COOLDOWN_MS         = 60000; // 60 seconds

// ── Check any recent payment by timestamp (not just pending) ──
async function getLastRecentPayment(userId, isForce = false) {
  return await ActivationPayment.findOne({
    user: userId,
    isForceVerification: isForce,
    createdAt: { $gte: new Date(Date.now() - STK_COOLDOWN_MS) }
  }).sort({ createdAt: -1 });
}

// ════════════════════════════════════════════
// INITIATE ACTIVATION (KSh 120)
// ════════════════════════════════════════════
exports.initiateActivation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.activated) return res.status(400).json({ message: "Account already activated" });

    const { phone: rawPhone } = req.body;
    const phone = rawPhone || user.phone;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // ── Cooldown guard — checks ANY payment in last 60s ──
    const lastRecent = await getLastRecentPayment(user._id, false);
    if (lastRecent) {
      const elapsed   = Date.now() - new Date(lastRecent.createdAt).getTime();
      const remaining = Math.ceil((STK_COOLDOWN_MS - elapsed) / 1000);
      if (elapsed < STK_COOLDOWN_MS) {
        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting another prompt.`,
          cooldown: remaining
        });
      }
    }

    const reference = "ACT_" + Date.now() + "_" +
      Math.random().toString(36).substr(2, 6).toUpperCase();

    // Save payment record BEFORE calling PayHero
    await ActivationPayment.create({
      user:                user._id,
      phone,
      amount:              ACTIVATION_AMOUNT,
      reference,
      status:              "pending",
      isForceVerification: false
    });

    // ── Call PayHero ──
    await axios.post(
      `${process.env.PAYHERO_BASE_URL}/api/v2/payments`,
      {
        amount:             ACTIVATION_AMOUNT,
        phone_number:       phone,
        channel_id:         Number(process.env.PAYHERO_CHANNEL_ID),
        provider:           "m-pesa",
        external_reference: reference,
        callback_url:       process.env.PAYHERO_ACTIVATION_CALLBACK_URL
      },
      {
        headers: {
          Authorization:  `Basic ${process.env.PAYHERO_BASIC_AUTH}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    console.log(`[ACTIVATION] STK push sent → ${phone} | ref: ${reference}`);

    res.json({
      message:   "M-Pesa prompt sent. Enter your PIN to complete verification.",
      reference
    });

  } catch (err) {
    console.error("Activation error:", err.response?.data || err.message);

    // ── PayHero spam block — return clean message with cooldown ──
    if (
      err.response?.data?.error_code === "BAD_REQUEST" &&
      err.response?.data?.error_message?.toLowerCase().includes("blocked")
    ) {
      return res.status(429).json({
        message:  "Too many requests to this number. Please wait 2 minutes before trying again.",
        cooldown: 120
      });
    }

    // ── Timeout ──
    if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "M-Pesa gateway timed out. Please try again in a moment."
      });
    }

    res.status(500).json({
      message: "Failed to send M-Pesa prompt. Please try again."
    });
  }
};

// ════════════════════════════════════════════
// INITIATE FORCE VERIFICATION (KSh 100)
// ════════════════════════════════════════════
exports.initiateForceVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.activated) {
      return res.status(403).json({
        message: "Complete KSh 120 account verification first."
      });
    }

    if (user.forceVerified) {
      return res.status(400).json({
        message: "Force withdrawal already completed."
      });
    }

    const phone = user.activationPhone || user.phone;

    // ── Cooldown guard — checks ANY payment in last 60s ──
    const lastRecent = await getLastRecentPayment(user._id, true);
    if (lastRecent) {
      const elapsed   = Date.now() - new Date(lastRecent.createdAt).getTime();
      const remaining = Math.ceil((STK_COOLDOWN_MS - elapsed) / 1000);
      if (elapsed < STK_COOLDOWN_MS) {
        return res.status(429).json({
          message:  `Please wait ${remaining} seconds before requesting another prompt.`,
          cooldown: remaining
        });
      }
    }

    const reference = "FV_" + Date.now() + "_" +
      Math.random().toString(36).substr(2, 6).toUpperCase();

    // Save payment record BEFORE calling PayHero
    await ActivationPayment.create({
      user:                user._id,
      phone,
      amount:              FORCE_VERIFICATION_AMOUNT,
      reference,
      status:              "pending",
      isForceVerification: true
    });

    // ── Call PayHero ──
    await axios.post(
      `${process.env.PAYHERO_BASE_URL}/api/v2/payments`,
      {
        amount:             FORCE_VERIFICATION_AMOUNT,
        phone_number:       phone,
        channel_id:         Number(process.env.PAYHERO_CHANNEL_ID),
        provider:           "m-pesa",
        external_reference: reference,
        callback_url:       process.env.PAYHERO_CALLBACK_URL
      },
      {
        headers: {
          Authorization:  `Basic ${process.env.PAYHERO_BASIC_AUTH}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    console.log(`[FORCE VERIFY] STK push sent → ${phone} | ref: ${reference}`);

    res.json({
      message:   "M-Pesa prompt sent to your registered number.",
      reference,
      phone
    });

  } catch (err) {
    console.error("Force verification error:", err.response?.data || err.message);

    if (
      err.response?.data?.error_code === "BAD_REQUEST" &&
      err.response?.data?.error_message?.toLowerCase().includes("blocked")
    ) {
      return res.status(429).json({
        message:  "Too many requests to this number. Please wait 2 minutes before trying again.",
        cooldown: 120
      });
    }

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "M-Pesa gateway timed out. Please try again in a moment."
      });
    }

    res.status(500).json({
      message: "Failed to send M-Pesa prompt. Please try again."
    });
  }
};

// ════════════════════════════════════════════
// CHECK ACTIVATION STATUS
// ════════════════════════════════════════════
exports.checkActivationStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await ActivationPayment.findOne({ reference });
    if (!payment) return res.status(404).json({ status: "not_found" });

    if (payment.status === "success") {
      const user = await User.findById(payment.user);
      return res.json({
        status:    "success",
        activated: user?.activated || false
      });
    }

    if (payment.status === "failed") {
      return res.json({ status: "failed" });
    }

    return res.json({ status: "pending" });

  } catch (err) {
    console.error("Status check error:", err.message);
    res.status(500).json({ message: "Status check failed" });
  }
};

// ════════════════════════════════════════════
// ACTIVATION CALLBACK (KSh 120)
// ════════════════════════════════════════════
exports.activationCallback = async (req, res) => {
  try {
    const body = req.body;
    const ref  = body?.response?.ExternalReference || body?.ExternalReference;
    const code = body?.response?.ResultCode        ?? body?.ResultCode;

    if (!ref) {
      console.warn("[ACTIVATION CALLBACK] Missing reference");
      return res.sendStatus(400);
    }

    const payment = await ActivationPayment.findOne({ reference: ref });
    if (!payment) {
      console.warn(`[ACTIVATION CALLBACK] Payment not found: ${ref}`);
      return res.sendStatus(404);
    }

    // Ignore duplicate callbacks
    if (payment.status !== "pending") {
      console.log(`[ACTIVATION CALLBACK] Already processed: ${ref} → ${payment.status}`);
      return res.sendStatus(200);
    }

    if (String(code) === "0") {
      payment.status = "success";
      await payment.save();

      const user = await User.findById(payment.user);
      if (user && !user.activated) {
        user.activated      = true;
        user.activationPhone = payment.phone;
        await user.save();

        await Transaction.create({
          user:         user._id,
          type:         "activation",
          amount:       -ACTIVATION_AMOUNT,
          description:  "One-time account verification fee",
          balanceAfter: user.balance,
          status:       "completed"
        });

        console.log(`[ACTIVATION CALLBACK] Success → user: ${user._id}`);
      }
    } else {
      payment.status = "failed";
      await payment.save();
      console.log(`[ACTIVATION CALLBACK] Failed → ref: ${ref} | code: ${code}`);
    }

    res.sendStatus(200);

  } catch (err) {
    console.error("[ACTIVATION CALLBACK] Error:", err.message);
    res.sendStatus(500);
  }
};

// ════════════════════════════════════════════
// FORCE VERIFICATION CALLBACK (KSh 100)
// ════════════════════════════════════════════
exports.forceVerificationCallback = async (req, res) => {
  try {
    const body = req.body;
    const ref  = body?.response?.ExternalReference || body?.ExternalReference;
    const code = body?.response?.ResultCode        ?? body?.ResultCode;

    if (!ref || !ref.startsWith("FV_")) {
      console.warn("[FORCE CALLBACK] Invalid or missing reference");
      return res.sendStatus(400);
    }

    const payment = await ActivationPayment.findOne({ reference: ref });
    if (!payment) {
      console.warn(`[FORCE CALLBACK] Payment not found: ${ref}`);
      return res.sendStatus(404);
    }

    // Ignore duplicate callbacks
    if (payment.status !== "pending") {
      console.log(`[FORCE CALLBACK] Already processed: ${ref} → ${payment.status}`);
      return res.sendStatus(200);
    }

    if (String(code) === "0") {
      payment.status = "success";
      await payment.save();

      const user = await User.findById(payment.user);
      if (user && !user.forceVerified) {
        user.forceVerified = true;
        await user.save();

        await Transaction.create({
          user:         user._id,
          type:         "activation",
          amount:       -FORCE_VERIFICATION_AMOUNT,
          description:  "Force withdrawal activation fee",
          balanceAfter: user.balance,
          status:       "completed"
        });

        console.log(`[FORCE CALLBACK] Success → user: ${user._id}`);
      }
    } else {
      payment.status = "failed";
      await payment.save();
      console.log(`[FORCE CALLBACK] Failed → ref: ${ref} | code: ${code}`);
    }

    res.sendStatus(200);

  } catch (err) {
    console.error("[FORCE CALLBACK] Error:", err.message);
    res.sendStatus(500);
  }
};