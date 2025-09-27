require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'crane-error-finder-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/craneDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ---------- SCHEMAS ---------- //

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Crane Error Schema
const craneErrorSchema = new mongoose.Schema({
    craneId: { type: String, required: true },
    errorType: { type: String, required: true },
    severity: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
    description: { type: String, required: true },
    reportedBy: { type: String, required: true },
    status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Resolved'] },
    location: String,
    timestamp: { type: Date, default: Date.now },
    resolvedAt: Date,
    notes: String
});
// Add errorCode field
craneErrorSchema.add({
    errorCode: {
        type: String,
        uppercase: true,
        match: [/^[A-Z0-9]{3,10}$/, 'Error code must be 3-10 alphanumeric characters']
    }
});
const CraneError = mongoose.model('CraneError', craneErrorSchema);

// Error Code Database Schema
const errorCodeSchema = new mongoose.Schema({
    errorCode: { type: String, required: true, unique: true, uppercase: true },
    errorType: { type: String, required: true, enum: ['Mechanical', 'Electrical', 'Hydraulic', 'Software', 'Safety', 'Electronic'] },
    severity: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
    description: { type: String, required: true },
    symptoms: [String],
    causes: [String],
    solutions: [String],
    immediateActions: [String],
    requiredTools: [String],
    estimatedFixTime: { type: Number, min: 0.5, max: 48 },
    safetyPrecautions: [String],
    commonAffectedModels: [String],
    references: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const ErrorCode = mongoose.model('ErrorCode', errorCodeSchema);

// ---------- AUTH MIDDLEWARE ---------- //
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// ---------- ROUTES ---------- //

// Base
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// AUTH
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ success: true, message: 'User created successfully' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        req.session.userId = user._id;
        req.session.username = user.username;
        res.json({ success: true, message: 'Login successful' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/user', (req, res) => {
    if (req.session.userId) res.json({ username: req.session.username });
    else res.status(401).json({ error: 'Not authenticated' });
});

// CRANE ERRORS
app.post('/api/errors', requireAuth, async (req, res) => {
    try {
        const errorData = { ...req.body, reportedBy: req.session.username };
        const error = new CraneError(errorData);
        await error.save();
        res.json({ success: true, error });
    } catch {
        res.status(500).json({ error: 'Failed to create error report' });
    }
});

app.get('/api/errors', requireAuth, async (req, res) => {
    try {
        const { limit } = req.query;
        let query = CraneError.find().sort({ timestamp: -1 });
        if (limit) query = query.limit(parseInt(limit));
        const errors = await query;
        res.json(errors);
    } catch {
        res.status(500).json({ error: 'Failed to fetch errors' });
    }
});

app.delete('/api/errors', requireAuth, async (req, res) => {
    try {
        await CraneError.deleteMany({});
        res.json({ success: true, message: 'All errors deleted' });
    } catch {
        res.status(500).json({ error: 'Failed to clear errors' });
    }
});

app.put('/api/errors/:id', requireAuth, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const updateData = { status };
        if (status === 'Resolved') updateData.resolvedAt = new Date();
        if (notes) updateData.notes = notes;

        const error = await CraneError.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, error });
    } catch {
        res.status(500).json({ error: 'Failed to update error' });
    }
});

app.get('/api/stats', requireAuth, async (req, res) => {
    try {
        const totalErrors = await CraneError.countDocuments();
        const openErrors = await CraneError.countDocuments({ status: 'Open' });
        const inProgressErrors = await CraneError.countDocuments({ status: 'In Progress' });
        const resolvedErrors = await CraneError.countDocuments({ status: 'Resolved' });

        const severityStats = await CraneError.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]);

        res.json({ totalErrors, openErrors, inProgressErrors, resolvedErrors, severityStats });
    } catch {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// ERROR CODE DB
app.get('/api/error-codes', requireAuth, async (req, res) => {
    try {
        const { search, errorType, severity } = req.query;
        let filter = {};
        if (search) {
            filter.$or = [
                { errorCode: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (errorType) filter.errorType = errorType;
        if (severity) filter.severity = severity;

        const errorCodes = await ErrorCode.find(filter).sort({ errorCode: 1 });
        res.json(errorCodes);
    } catch {
        res.status(500).json({ error: 'Failed to fetch error codes' });
    }
});

app.get('/api/error-codes/:code', requireAuth, async (req, res) => {
    try {
        const errorCode = await ErrorCode.findOne({ errorCode: req.params.code.toUpperCase() });
        if (!errorCode) return res.status(404).json({ error: 'Error code not found' });
        res.json(errorCode);
    } catch {
        res.status(500).json({ error: 'Failed to fetch error code' });
    }
});

app.post('/api/error-codes/init', requireAuth, async (req, res) => {
    try {
        const existingCount = await ErrorCode.countDocuments();
        if (existingCount > 0) return res.json({ message: 'Error code database already initialized' });

        const sampleErrorCodes = [
            {
                errorCode: "E001",
                errorType: "Hydraulic",
                severity: "High",
                description: "Hydraulic System Pressure Loss",
                symptoms: ["Slow boom movement", "Unable to lift rated loads", "Hydraulic fluid leakage visible", "Unusual pump noise"],
                causes: ["Hydraulic fluid leak", "Faulty pressure relief valve", "Worn pump seals", "Clogged filters"],
                solutions: ["Check and repair hydraulic lines", "Replace pressure relief valve", "Inspect and replace pump seals", "Clean or replace hydraulic filters"],
                immediateActions: ["Stop crane operation immediately", "Check hydraulic fluid level", "Inspect for visible leaks", "Do not attempt to lift loads"],
                requiredTools: ["Pressure gauge", "Wrench set", "Leak detection kit"],
                estimatedFixTime: 4,
                safetyPrecautions: ["Release hydraulic pressure before working", "Use proper PPE", "Secure crane against movement"],
                commonAffectedModels: ["LTM 1100", "GMK 3050", "AC 250"]
            },
            {
                errorCode: "E002",
                errorType: "Electrical",
                severity: "Critical",
                description: "Emergency Stop Circuit Failure",
                symptoms: ["Emergency stop button not functioning", "Control panel error lights", "Crane continues operation when stopped"],
                causes: ["Faulty emergency stop button", "Broken wiring in safety circuit", "Control relay failure", "Software glitch"],
                solutions: ["Test and replace emergency stop button", "Check and repair safety circuit wiring", "Replace control relays", "Update control software"],
                immediateActions: ["Use secondary shutdown procedures", "Disconnect main power source", "Evacuate area if unsafe", "Contact supervisor immediately"],
                requiredTools: ["Multimeter", "Wiring diagrams", "Relay tester"],
                estimatedFixTime: 2,
                safetyPrecautions: ["Lock out/tag out power sources", "Test all safety systems after repair", "Verify with certified technician"],
                commonAffectedModels: ["All models with electronic controls"]
            }
            // Add more from sample list as needed...
        ];

        await ErrorCode.insertMany(sampleErrorCodes);
        res.json({ success: true, message: 'Error code database initialized successfully', count: sampleErrorCodes.length });
    } catch {
        res.status(500).json({ error: 'Failed to initialize error code database' });
    }
});

// ---------- START SERVER ---------- //
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
