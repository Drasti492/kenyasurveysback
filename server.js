require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

if (!process.env.JWT_SECRET) { console.error("JWT_SECRET missing"); process.exit(1); }
if (!process.env.MONGO_URI) { console.error("MONGO_URI missing"); process.exit(1); }

const allowedOrigins = [
  "https://kenya-premium-surveys.vercel.app",
  "https://kenyasurveysback.onrender.com",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/survey", require("./routes/surveyRoutes"));
app.use("/api/activation", require("./routes/activationRoutes"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => { console.error("DB error:", err.message); process.exit(1); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Survey server running on port ${PORT}`));