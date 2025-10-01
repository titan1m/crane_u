const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'crane-error-finder-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/craneDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Error Code Schema
const errorCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    solution: { type: String, required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ErrorCode = mongoose.model('ErrorCode', errorCodeSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    errorCode: { type: String, required: true },
    craneModel: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// Seed sample error codes
async function seedErrorCodes() {
    try {
        const count = await ErrorCode.countDocuments();
        if (count === 0) {
            const sampleErrors = [
                {
                    code: "E001",
                    description: "Overload Protection Activated",
                    severity: "High",
                    solution: "Reduce load weight and reset system. Check load moment limiter settings.",
                    category: "Safety"
                },
                {
                    code: "E002",
                    description: "Boom Angle Sensor Malfunction",
                    severity: "Medium",
                    solution: "Calibrate or replace boom angle sensor. Check wiring connections.",
                    category: "Sensors"
                },
                {
                    code: "E003",
                    description: "Hydraulic Pressure Low",
                    severity: "High",
                    solution: "Check hydraulic fluid level, inspect pump and valves for leaks.",
                    category: "Hydraulics"
                },
                {
                    code: "E004",
                    description: "Emergency Stop Activated",
                    severity: "Critical",
                    solution: "Check all emergency stop buttons and safety circuits. Reset system.",
                    category: "Safety"
                },
                {
                    code: "E005",
                    description: "Wind Speed Exceeded",
                    severity: "High",
                    solution: "Wait for wind speed to decrease below safe operating limit.",
                    category: "Environmental"
                },
                {
                    code: "E006",
                    description: "Hoist Brake Fault",
                    severity: "Critical",
                    solution: "Inspect brake pads and adjustment. Check brake solenoid.",
                    category: "Mechanical"
                },
                {
                    code: "E007",
                    description: "Controller Communication Error",
                    severity: "Medium",
                    solution: "Check CAN bus connections and controller power supply.",
                    category: "Electrical"
                }
            ];
            await ErrorCode.insertMany(sampleErrors);
            console.log('Sample error codes seeded');
        }
    } catch (error) {
        console.error('Error seeding error codes:', error);
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Authentication required' });
    }
}

// Check auth status endpoint
app.get('/api/auth/status', (req, res) => {
    res.json({ 
        authenticated: !!req.session.userId,
        username: req.session.username 
    });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.username = user.username;
            res.json({ 
                success: true, 
                message: 'Login successful',
                user: { username: user.username }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Username or email already exists' });
        }
        
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ 
            username, 
            email, 
            password: hashedPassword 
        });
        
        await user.save();
        
        // Auto-login after signup
        req.session.userId = user._id;
        req.session.username = user.username;
        
        res.json({ 
            success: true, 
            message: 'User created successfully',
            user: { username: user.username }
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: 'Username or email already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Server error during signup' });
        }
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logout successful' });
    });
});

// Search error codes
app.get('/api/error-codes', async (req, res) => {
    try {
        const { code, category, limit } = req.query;
        let query = {};
        
        if (code) {
            query.code = new RegExp(code, 'i');
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        
        let queryBuilder = ErrorCode.find(query);
        
        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }
        
        const errorCodes = await queryBuilder.sort({ code: 1 });
        res.json(errorCodes);
    } catch (error) {
        console.error('Error codes search error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get error code by ID
app.get('/api/error-codes/:code', async (req, res) => {
    try {
        const errorCode = await ErrorCode.findOne({ code: req.params.code.toUpperCase() });
        if (!errorCode) {
            return res.status(404).json({ error: 'Error code not found' });
        }
        res.json(errorCode);
    } catch (error) {
        console.error('Error code fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create report
app.post('/api/reports', requireAuth, async (req, res) => {
    try {
        const { errorCode, craneModel, location, description } = req.body;
        
        if (!errorCode || !craneModel || !location) {
            return res.status(400).json({ success: false, message: 'Error code, crane model, and location are required' });
        }
        
        const report = new Report({
            userId: req.session.userId,
            errorCode: errorCode.toUpperCase(),
            craneModel,
            location,
            description: description || ''
        });
        
        await report.save();
        res.json({ success: true, message: 'Report created successfully', reportId: report._id });
    } catch (error) {
        console.error('Report creation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get user reports
app.get('/api/reports', requireAuth, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.session.userId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username');
        res.json(reports);
    } catch (error) {
        console.error('Reports fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all error codes for dropdown
app.get('/api/all-error-codes', async (req, res) => {
    try {
        const errorCodes = await ErrorCode.find({}, 'code description').sort({ code: 1 });
        res.json(errorCodes);
    } catch (error) {
        console.error('All error codes fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize database and start server
async function startServer() {
    try {
        await seedErrorCodes();
        
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
