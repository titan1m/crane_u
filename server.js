import mongoose from "mongoose";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());

// __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Static (serve your frontend from /public)
app.use(express.static(path.join(__dirname, "public")));

// ---------- MongoDB Connect then Start ----------
mongoose
  .connect(process.env.MONGO_URI, {
    // Mongoose v8 ignores old options but keeping them won't break
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      // No emoji here to avoid Render parse issues
      console.log("Server running on port " + PORT);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));

// ---------- Schemas (no breaking changes) ----------
// USERS
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String
  },
  { strict: true } // unknown fields ignored (no data mutation)
);

// CRANES
const CraneSchema = new mongoose.Schema(
  {
    model: String,           // e.g. "HIAB T-HiDuo 018"
    code: String,            // e.g. "E009"
    description: String,     // text
    severity: String,        // optional: "Low" | "Medium" | "High"
    lastMaintenance: String, // optional date string
    steps: [
      {
        title: String,
        description: String
      }
    ],
    createdAt: { type: Date, default: Date.now }
  },
  { strict: true }           // safe: won't rewrite existing docs
);

// ---------- Models (fixed collection names) ----------
const User = mongoose.model("User", UserSchema, "users");
const Crane = mongoose.model("Crane", CraneSchema, "cranes");

// ---------- Helpers ----------
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- Routes ----------

// Health check
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));

// ----- Auth -----
app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username & password required" });
    }
    const exists = await User.findOne({ username }).lean();
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = new User({ username, password });
    await user.save();
    return res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username & password required" });
    }
    const user = await User.findOne({ username, password }).lean();
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    next(err);
  }
});

// ----- Cranes -----
// Create / Save crane (non-destructive; adds new document)
app.post("/api/crane", async (req, res, next) => {
  try {
    const crane = new Crane(req.body || {});
    await crane.save();
    return res.status(201).json({ message: "Crane data saved", id: crane._id });
  } catch (err) {
    next(err);
  }
});

// Get single by code OR model (case-insensitive exact match)
app.get("/api/crane/:code", async (req, res, next) => {
  try {
    const raw = decodeURIComponent(req.params.code || "");
    const rx = new RegExp("^" + escapeRegex(raw) + "$", "i");
    const crane = await Crane.findOne({ $or: [{ code: rx }, { model: rx }] }).lean();

    if (!crane) {
      return res
        .status(404)
        .json({ message: "No data found for this model or error code" });
    }
    return res.status(200).json(crane);
  } catch (err) {
    next(err);
  }
});

// List all cranes (with optional pagination: ?page=1&limit=20)
app.get("/api/cranes", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Crane.find().skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Crane.countDocuments()
    ]);

    return res.status(200).json({
      page,
      limit,
      total,
      items
    });
  } catch (err) {
    next(err);
  }
});

// Optional: flexible search via query params (?q=E009 or ?model=HIAB ...)
app.get("/api/crane", async (req, res, next) => {
  try {
    const { q, model, code } = req.query || {};
    const ors = [];
    if (q) {
      const rx = new RegExp(escapeRegex(String(q)), "i");
      ors.push({ model: rx }, { code: rx }, { description: rx });
    }
    if (model) ors.push({ model: new RegExp(escapeRegex(String(model)), "i") });
    if (code) ors.push({ code: new RegExp(escapeRegex(String(code)), "i") });

    if (!ors.length) {
      return res.status(400).json({ message: "Provide q or model or code" });
    }

    const items = await Crane.find({ $or: ors }).limit(100).lean();
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
});

// ---------- 404 & Error Handling ----------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({ message: "Server error", detail: err?.message || "" });
});
