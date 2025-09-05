import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
// REMOVED: import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
// REMOVED: app.use(cors());
app.use(bodyParser.json());

// Basic CORS headers manually
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ---------- MongoDB Connection ----------
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Connect to database first, then start server
connectDB().then(() => {
  // Start server only after DB connection
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// ---------- Database connection events ----------
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// ---------- Schemas ----------
// USERS
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

// CRANES
const CraneSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    lastMaintenance: { type: Date },
    steps: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

// ---------- Models ----------
const User = mongoose.model("User", UserSchema);
const Crane = mongoose.model("Crane", CraneSchema);

// ---------- Helper Functions ----------
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- Routes ----------

// Health check
app.get("/healthz", (req, res) => res.status(200).json({ ok: true, message: "Server is healthy" }));

// Get all cranes
app.get("/api/cranes", async (req, res) => {
  try {
    const cranes = await Crane.find({});
    res.json(cranes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cranes", error: error.message });
  }
});

// Get crane by code
app.get("/api/crane/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const crane = await Crane.findOne({ code: new RegExp(`^${escapeRegex(code)}$`, 'i') });
    
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }
    
    res.json(crane);
  } catch (error) {
    res.status(500).json({ message: "Error fetching crane", error: error.message });
  }
});

// Create new crane
app.post("/api/crane", async (req, res) => {
  try {
    const crane = new Crane(req.body);
    await crane.save();
    res.status(201).json({ message: "Crane created successfully", crane });
  } catch (error) {
    res.status(400).json({ message: "Error creating crane", error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ message: "Internal server error", error: error.message });
});

// Handle uncaught exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
