import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/craneDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ✅ Cranes Schema
const craneSchema = new mongoose.Schema({
  model: String,
  code: String,
  description: String,
});
const Crane = mongoose.model("Crane", craneSchema, "cranes");

// ✅ Users Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema, "users");

// ------------------ ROUTES ------------------

// 🟢 Test Route
app.get("/", (req, res) => {
  res.send("🚀 Crane API Running...");
});

// 🟢 Get all cranes
app.get("/api/cranes", async (req, res) => {
  try {
    const cranes = await Crane.find();
    res.json(cranes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Get crane by code
app.get("/api/cranes/:code", async (req, res) => {
  try {
    const crane = await Crane.findOne({ code: req.params.code });
    if (!crane) return res.status(404).json({ message: "Crane not found" });
    res.json(crane);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Add new crane
app.post("/api/cranes", async (req, res) => {
  try {
    const crane = new Crane(req.body);
    await crane.save();
    res.status(201).json(crane);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🟢 Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Register new user
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------ START SERVER ------------------
const PORT = 5000;
app.listen(PORT, () => console.log(🚀 Server running on http://localhost:${PORT}));

