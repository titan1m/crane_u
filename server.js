import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB Connect & Start Server after connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB Connected");
  app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
  });
})
.catch(err => console.error("❌ MongoDB Error:", err));

// ----------------- SCHEMAS -----------------

// 🟢 Users Collection
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

// 🟢 Cranes Collection
const CraneSchema = new mongoose.Schema({
  model: String,            // Crane model (e.g. KATO-CRX)
  code: String,             // Error code (e.g. E101)
  description: String,      // Error description
  severity: String,         // Low | Medium | High
  lastMaintenance: String,  // Date string
  steps: [                  // Troubleshooting steps
    {
      title: String,
      description: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// ----------------- MODELS -----------------
const User = mongoose.model("User", UserSchema, "users");
const Crane = mongoose.model("Crane", CraneSchema, "cranes");

// ----------------- ROUTES -----------------

// 🟢 Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "⚠ User already exists" });

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "✅ Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error during signup" });
  }
});

// 🟢 Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "❌ Invalid credentials" });

    res.status(200).json({ message: "✅ Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error during login" });
  }
});

// 🟢 Save Crane Data
app.post("/api/crane", async (req, res) => {
  try {
    const crane = new Crane(req.body);
    await crane.save();
    res.status(201).json({ message: "✅ Crane data saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to save crane data" });
  }
});

// 🟢 Fetch Crane by model OR code
app.get("/api/crane/:code", async (req, res) => {
  try {
    const query = {
      $or: [
        { code: req.params.code },
        { model: req.params.code }
      ]
    };

    const crane = await Crane.findOne(query);

    if (!crane) {
      return res.status(404).json({ message: "❌ No data found for this model or error code" });
    }

    res.status(200).json(crane);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error fetching crane data" });
  }
});

// 🟢 Get All Cranes
app.get("/api/cranes", async (req, res) => {
  try {
    const cranes = await Crane.find();
    res.status(200).json(cranes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to fetch cranes list" });
  }
});

// 🟢 Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Failed to fetch users list" });
  }
});
