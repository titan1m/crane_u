// server.js - Improved MongoDB connection
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

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

// Improved MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/craneDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Schema definitions remain the same...
// ... (keep your existing schemas)

// Add this middleware to handle CORS and preflight requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Mock data for development (remove in production)
const initializeMockData = async () => {
    try {
        const errorCount = await CraneError.countDocuments();
        if (errorCount === 0) {
            console.log('📥 Adding sample error data...');
            await CraneError.insertMany([
                {
                    craneId: "CRN-001",
                    errorType: "Mechanical",
                    severity: "High",
                    description: "Hydraulic fluid leak in boom cylinder",
                    reportedBy: "admin",
                    status: "Open",
                    location: "Construction Site A",
                    timestamp: new Date()
                },
                {
                    craneId: "CRN-002",
                    errorType: "Electrical",
                    severity: "Critical",
                    description: "Control panel malfunction",
                    reportedBy: "admin",
                    status: "In Progress",
                    location: "Warehouse 3",
                    timestamp: new Date()
                }
            ]);
        }

        const errorCodeCount = await ErrorCode.countDocuments();
        if (errorCodeCount === 0) {
            console.log('📥 Adding sample error codes...');
            await ErrorCode.insertMany([
                {
                    errorCode: "E001",
                    errorType: "Hydraulic",
                    severity: "High",
                    description: "Hydraulic System Pressure Loss",
                    symptoms: ["Slow boom movement", "Unable to lift rated loads"],
                    causes: ["Hydraulic fluid leak", "Faulty pressure relief valve"],
                    solutions: ["Check and repair hydraulic lines", "Replace pressure relief valve"],
                    immediateActions: ["Stop crane operation immediately", "Check hydraulic fluid level"],
                    requiredTools: ["Pressure gauge", "Wrench set"],
                    estimatedFixTime: 4,
                    safetyPrecautions: ["Release hydraulic pressure before working"],
                    commonAffectedModels: ["LTM 1100", "GMK 3050"]
                },
                {
                    errorCode: "E002",
                    errorType: "Electrical",
                    severity: "Critical",
                    description: "Emergency Stop Circuit Failure",
                    symptoms: ["Emergency stop button not functioning"],
                    causes: ["Faulty emergency stop button", "Broken wiring"],
                    solutions: ["Test and replace emergency stop button"],
                    immediateActions: ["Use secondary shutdown procedures"],
                    requiredTools: ["Multimeter", "Wiring diagrams"],
                    estimatedFixTime: 2,
                    safetyPrecautions: ["Lock out/tag out power sources"],
                    commonAffectedModels: ["All models with electronic controls"]
                }
            ]);
        }
    } catch (error) {
        console.error('Error initializing mock data:', error);
    }
};

// Your existing routes remain the same...
// ... (keep your existing routes)

// Add this error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await initializeMockData();
});
