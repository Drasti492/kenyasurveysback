const jwt = require("jsonwebtoken");
const User = require("../models/User");

function formatPhone(raw) {
    let p = raw.replace(/\s+/g, "").replace(/^0/, "254");
    if (p.startsWith("+")) p = p.slice(1);
    if (!/^254(7\d{8}|1\d{8})$/.test(p)) return null;
    return p;
}

function validatePin(pin) {
    if (!/^\d{4}$/.test(pin)) return "PIN must be exactly 4 digits";
    if (/^(\d)\1{3}$/.test(pin)) return "PIN too simple";
    const d = pin.split("").map(Number);
    let a = true, de = true;
    for (let i = 1; i < 4; i++) {
        if (d[i] !== d[i - 1] + 1) a = false;
        if (d[i] !== d[i - 1] - 1) de = false;
    }
    if (a || de) return "Avoid sequences like 1234 or 9876";
    return null;
}

exports.register = async (req, res) => {
    try {
        const { phone: rawPhone, pin, pin2 } = req.body;
        if (!rawPhone) return res.status(400).json({ message: "Phone required" });
        if (!pin) return res.status(400).json({ message: "PIN required" });
        if (!pin2) return res.status(400).json({ message: "Please confirm your PIN" });
        if (pin !== pin2) return res.status(400).json({ message: "PINs do not match" });

        const pinErr = validatePin(pin);
        if (pinErr) return res.status(400).json({ message: pinErr });

        const phone = formatPhone(rawPhone);
        if (!phone) return res.status(400).json({ message: "Enter a valid Kenyan number (07XX or 01XX)" });

        const existing = await User.findOne({ phone });
        if (existing) return res.status(409).json({ message: "Account already exists. Please sign in." });

        const user = await User.create({
            phone,
            pin,
            balance: 50,
            welcomeBonusApplied: true,
            profileComplete: false,
            activated: false,
            completedQuestions: [],
            currentPage: 0,
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.json({ token, message: "Account created. Welcome bonus of KSh 50 credited!" });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ message: "Registration failed. Try again." });
    }
};

exports.login = async (req, res) => {
    try {
        const { phone: rawPhone, pin } = req.body;
        if (!rawPhone || !pin) return res.status(400).json({ message: "Phone and PIN required" });

        const phone = formatPhone(rawPhone);
        if (!phone) return res.status(400).json({ message: "Invalid phone number" });

        const user = await User.findOne({ phone }).select("+pin");
        if (!user) return res.status(400).json({ message: "No account found. Please register." });

        if (user.pin !== pin) return res.status(400).json({ message: "Incorrect PIN. Try again." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.json({ token });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: "Login failed. Try again." });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-pin");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
};

exports.completeProfile = async (req, res) => {
    try {
        const { name, county, occupation, education } = req.body;
        if (!name || !county || !occupation || !education) {
            return res.status(400).json({ message: "All profile fields are required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.profileComplete) {
            return res.status(400).json({ message: "Profile already completed" });
        }

        user.name = name;
        user.county = county;
        user.occupation = occupation;
        user.education = education;
        user.profileComplete = true;
        await user.save();

        res.json({ message: "Profile completed successfully", balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: "Failed to complete profile" });
    }
};