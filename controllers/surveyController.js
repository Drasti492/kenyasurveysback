const User = require("../models/user");
const Transaction = require("../models/Transaction");
const { questions, QUESTIONS_PER_PAGE } = require("../data/questions");

exports.getQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const start = page * QUESTIONS_PER_PAGE;
        const end = start + QUESTIONS_PER_PAGE;
        const pageQuestions = questions.slice(start, end).map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            reward: q.reward,
            category: q.category,
        }));

        res.json({
            questions: pageQuestions,
            totalPages: Math.ceil(questions.length / QUESTIONS_PER_PAGE),
            totalQuestions: questions.length,
            page,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to load questions" });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const { questionId, answer } = req.body;
        if (questionId === undefined || answer === undefined) {
            return res.status(400).json({ message: "questionId and answer required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.completedQuestions.includes(questionId)) {
            return res.status(400).json({ message: "Question already answered", alreadyAnswered: true });
        }

        const question = questions.find((q) => q.id === questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const correct = question.correctIndex === parseInt(answer);
        let earned = 0;

        if (correct) {
            earned = question.reward;
            user.balance = parseFloat((user.balance + earned).toFixed(2));
            user.totalEarned = parseFloat(((user.totalEarned || 0) + earned).toFixed(2));

            await Transaction.create({
                user: user._id,
                type: "survey_reward",
                amount: earned,
                description: `Survey reward: ${question.category}`,
                balanceAfter: user.balance,
            });
        }

        user.completedQuestions.push(questionId);
        await user.save();

        res.json({
            correct,
            earned,
            balance: user.balance,
            correctIndex: question.correctIndex,
            explanation: question.explanation,
        });
    } catch (err) {
        console.error("Submit answer error:", err.message);
        res.status(500).json({ message: "Failed to submit answer" });
    }
};

exports.getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-pin");
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            balance: user.balance,
            totalEarned: user.totalEarned || 0,
            completedQuestions: user.completedQuestions.length,
            totalQuestions: questions.length,
            activated: user.activated,
            transactions,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to load stats" });
    }
};

exports.initiateWithdrawal = async (req, res) => {
    try {
        const { amount, mpesaPhone } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.activated) {
            return res.status(403).json({ message: "Activate your account (KSh 150) to withdraw funds" });
        }

        const withdrawAmt = parseFloat(amount);
        if (!withdrawAmt || withdrawAmt < 150) {
            return res.status(400).json({ message: "Minimum withdrawal is KSh 150" });
        }

        if (user.balance < withdrawAmt) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        user.balance = parseFloat((user.balance - withdrawAmt).toFixed(2));

        await Transaction.create({
            user: user._id,
            type: "withdrawal",
            amount: -withdrawAmt,
            description: `Withdrawal to M-Pesa ${mpesaPhone}`,
            balanceAfter: user.balance,
            status: "pending",
        });

        await user.save();

        res.json({
            message: "Withdrawal request submitted. You will receive your funds within 24 hours.",
            balance: user.balance,
        });
    } catch (err) {
        res.status(500).json({ message: "Withdrawal failed. Try again." });
    }
};