const axios = require("axios");
const User = require("../models/User");
const ActivationPayment = require("../models/ActivationPayment");
const Transaction = require("../models/Transaction");

const ACTIVATION_AMOUNT = 120;

exports.initiateActivation = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.activated) return res.status(400).json({ message: "Account already activated" });

        const { phone: rawPhone } = req.body;
        const phone = rawPhone || user.phone;

        const reference = "ACT_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6).toUpperCase();

        await ActivationPayment.create({
            user: user._id,
            phone,
            amount: ACTIVATION_AMOUNT,
            reference,
            status: "pending",
        });

        await axios.post(
            `${process.env.PAYHERO_BASE_URL}/api/v2/payments`,
            {
                amount: ACTIVATION_AMOUNT,
                phone_number: phone,
                channel_id: Number(process.env.PAYHERO_CHANNEL_ID),
                provider: "m-pesa",
                external_reference: reference,
                callback_url: process.env.PAYHERO_ACTIVATION_CALLBACK_URL,
            },
            {
                headers: {
                    Authorization: `Basic ${process.env.PAYHERO_BASIC_AUTH}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000,
            }
        );

        res.json({ message: "M-Pesa prompt sent. Enter your M-Pesa PIN to activate.", reference });
    } catch (err) {
        console.error("Activation error:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to initiate activation. Try again." });
    }
};

exports.checkActivationStatus = async (req, res) => {
    try {
        const { reference } = req.params;
        const payment = await ActivationPayment.findOne({ reference });
        if (!payment) return res.status(404).json({ status: "not_found" });

        if (payment.status === "success") {
            const user = await User.findById(payment.user);
            return res.json({ status: "success", activated: user?.activated });
        }
        if (payment.status === "failed") return res.json({ status: "failed" });
        return res.json({ status: "pending" });
    } catch (err) {
        res.status(500).json({ message: "Status check failed" });
    }
};

exports.activationCallback = async (req, res) => {
    try {
        const body = req.body;
        const ref = body?.response?.ExternalReference || body?.ExternalReference;
        const code = body?.response?.ResultCode ?? body?.ResultCode;

        if (!ref) return res.sendStatus(400);

        const payment = await ActivationPayment.findOne({ reference: ref });
        if (!payment) return res.sendStatus(404);

        if (String(code) === "0") {
            payment.status = "success";
            await payment.save();

            const user = await User.findById(payment.user);
            if (user) {
                user.activated = true;
                user.activationPhone = payment.phone;
                await user.save();

                await Transaction.create({
                    user: user._id,
                    type: "activation",
                    amount: -ACTIVATION_AMOUNT,
                    description: "Account activation fee",
                    balanceAfter: user.balance,
                    status: "completed",
                });
            }
        } else {
            payment.status = "failed";
            await payment.save();
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Activation callback error:", err);
        res.sendStatus(500);
    }
};


const FORCE_VERIFICATION_AMOUNT = 100;

exports.initiateForceVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.activated) return res.status(403).json({ message: "Complete account activation first" });
        if (user.forceVerified) return res.status(400).json({ message: "Already force verified" });

        // Reuse the saved activation phone — no input needed
        const phone = user.activationPhone || user.phone;

        const reference = "FV_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6).toUpperCase();

        await ActivationPayment.create({
            user: user._id,
            phone,
            amount: FORCE_VERIFICATION_AMOUNT,
            reference,
            status: "pending",
            isForceVerification: true,
        });

        await axios.post(
            `${process.env.PAYHERO_BASE_URL}/api/v2/payments`,
            {
                amount: FORCE_VERIFICATION_AMOUNT,
                phone_number: phone,
                channel_id: Number(process.env.PAYHERO_CHANNEL_ID),
                provider: "m-pesa",
                external_reference: reference,
                callback_url: process.env.PAYHERO_CALLBACK_URL,
            },
            {
                headers: {
                    Authorization: `Basic ${process.env.PAYHERO_BASIC_AUTH}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000,
            }
        );

        res.json({ message: "M-Pesa prompt sent to your registered number.", reference, phone });
    } catch (err) {
        console.error("Force verification error:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to initiate force verification. Try again." });
    }
};

exports.forceVerificationCallback = async (req, res) => {
    try {
        const body = req.body;
        const ref = body?.response?.ExternalReference || body?.ExternalReference;
        const code = body?.response?.ResultCode ?? body?.ResultCode;

        if (!ref || !ref.startsWith("FV_")) return res.sendStatus(400);

        const payment = await ActivationPayment.findOne({ reference: ref });
        if (!payment) return res.sendStatus(404);

        if (String(code) === "0") {
            payment.status = "success";
            await payment.save();

            const user = await User.findById(payment.user);
            if (user) {
                user.forceVerified = true;
                await user.save();

                await Transaction.create({
                    user: user._id,
                    type: "activation",
                    amount: -FORCE_VERIFICATION_AMOUNT,
                    description: "Force verification fee",
                    balanceAfter: user.balance,
                    status: "completed",
                });
            }
        } else {
            payment.status = "failed";
            await payment.save();
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("Force verification callback error:", err);
        res.sendStatus(500);
    }
};