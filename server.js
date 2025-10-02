const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'crane-error-finder-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage (in production, use a real database)
let users = [];
let errors = [];
let errorCodes = [];
let reports = [];

// Sample error codes data
const sampleErrorCodes = [
    {
        id: uuidv4(),
        errorCode: "E001",
        errorType: "Hydraulic",
        severity: "High",
        description: "Hydraulic System Pressure Loss",
        symptoms: ["Slow boom movement", "Unable to lift rated loads", "Hydraulic fluid leakage"],
        causes: ["Hydraulic fluid leak", "Faulty pressure relief valve", "Worn pump seals"],
        solutions: ["Check and repair hydraulic lines", "Replace pressure relief valve", "Inspect pump seals"],
        immediateActions: ["Stop crane operation immediately", "Check hydraulic fluid level"],
        requiredTools: ["Pressure gauge", "Wrench set"],
        estimatedFixTime: 4,
        safetyPrecautions: ["Release hydraulic pressure before working", "Use proper PPE"],
        commonAffectedModels: ["LTM 1100", "GMK 3050", "AC 250"]
    },
    {
        id: uuidv4(),
        errorCode: "E002",
        errorType: "Electrical",
        severity: "Critical", 
        description: "Emergency Stop Circuit Failure",
        symptoms: ["Emergency stop button not functioning", "Control panel error lights"],
        causes: ["Faulty emergency stop button", "Broken wiring", "Control relay failure"],
        solutions: ["Test and replace emergency stop button", "Check safety circuit wiring"],
        immediateActions: ["Use secondary shutdown procedures", "Disconnect main power"],
        requiredTools: ["Multimeter", "Wiring diagrams"],
        estimatedFixTime: 2,
        safetyPrecautions: ["Lock out/tag out power sources", "Test all safety systems"],
        commonAffectedModels: ["All models with electronic controls"]
    }
];

// Initialize sample data
errorCodes = [...sampleErrorCodes];

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auth status check
app.get('/api/auth/status', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.json({ authenticated: false });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        res.json({ 
            authenticated: true, 
            username: user.username 
        });
    } catch (error) {
        res.json({ authenticated: false });
    }
});

// User registration
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: uuidv4(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);

        // Generate token
        const token = jwt.sign(
            { userId: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Error codes endpoints
app.get('/api/error-codes', (req, res) => {
    const { code, type, severity, limit } = req.query;
    
    let filteredCodes = [...errorCodes];

    // Filter by code
    if (code) {
        filteredCodes = filteredCodes.filter(ec => 
            ec.errorCode.toLowerCase().includes(code.toLowerCase())
        );
    }

    // Filter by type
    if (type) {
        filteredCodes = filteredCodes.filter(ec => ec.errorType === type);
    }

    // Filter by severity
    if (severity) {
        filteredCodes = filteredCodes.filter(ec => ec.severity === severity);
    }

    // Apply limit
    if (limit) {
        filteredCodes = filteredCodes.slice(0, parseInt(limit));
    }

    res.json(filteredCodes);
});

app.get('/api/error-codes/:code', (req, res) => {
    const { code } = req.params;
    const errorCode = errorCodes.find(ec => ec.errorCode === code.toUpperCase());
    
    if (!errorCode) {
        return res.status(404).json({ 
            success: false, 
            message: 'Error code not found' 
        });
    }

    res.json(errorCode);
});

app.post('/api/error-codes/init', (req, res) => {
    errorCodes = [...sampleErrorCodes];
    res.json({ 
        success: true, 
        message: 'Error code database initialized with sample data',
        count: errorCodes.length
    });
});

// Error reports endpoints
app.get('/api/errors', (req, res) => {
    const { limit } = req.query;
    let errorList = [...errors].reverse(); // Show newest first

    if (limit) {
        errorList = errorList.slice(0, parseInt(limit));
    }

    res.json({
        success: true,
        errors: errorList,
        total: errors.length
    });
});

app.post('/api/errors', (req, res) => {
    try {
        const { craneId, errorType, severity, description, location, status } = req.body;

        // Validation
        if (!craneId || !errorType || !severity || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        const error = {
            id: uuidv4(),
            craneId,
            errorType,
            severity,
            description,
            location: location || 'Unknown Location',
            status: status || 'Open',
            reportedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        errors.push(error);

        res.json({
            success: true,
            message: 'Error reported successfully',
            error
        });

    } catch (error) {
        console.error('Error reporting error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

app.delete('/api/errors', (req, res) => {
    errors = [];
    res.json({
        success: true,
        message: 'All errors cleared successfully'
    });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
    const totalErrors = errors.length;
    const openErrors = errors.filter(e => e.status === 'Open').length;
    const inProgressErrors = errors.filter(e => e.status === 'In Progress').length;
    const resolvedErrors = errors.filter(e => e.status === 'Resolved').length;

    res.json({
        totalErrors,
        openErrors,
        inProgressErrors,
        resolvedErrors
    });
});

// Reports endpoints
app.get('/api/reports', (req, res) => {
    res.json(reports);
});

app.post('/api/reports', (req, res) => {
    try {
        const { errorCode, craneModel, location, description } = req.body;

        if (!errorCode || !craneModel || !location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        const report = {
            id: uuidv4(),
            errorCode,
            craneModel,
            location,
            description: description || '',
            status: 'Open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        reports.push(report);

        res.json({
            success: true,
            message: 'Report created successfully',
            report
        });

    } catch (error) {
        console.error('Report creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Serve all other routes (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Crane Error Finder server running on port ${PORT}`);
    console.log(`📱 Access the application at: http://localhost:${PORT}`);
});
