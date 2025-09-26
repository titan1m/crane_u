import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Schemas
const craneSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    steps: [{ title: String, description: String, image: String }],
    lastMaintenance: { type: Date, default: Date.now }
});
const Crane = mongoose.model('Crane', craneSchema);

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Serve HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/error-info.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'error-info.html')));

// API
app.get('/api/cranes', async (req, res) => {
    try { const cranes = await Crane.find(); res.json(cranes); } 
    catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/crane/:code', async (req, res) => {
    try {
        const crane = await Crane.findOne({ code: req.params.code });
        if (!crane) return res.status(404).json({ message: 'Crane not found' });
        res.json(crane);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Auth
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if(await User.findOne({ username })) return res.status(400).json({ message: 'User exists' });
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch(err){ res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        res.json({ token, message: 'Login successful' });
    } catch(err){ res.status(500).json({ message: err.message }); }
});

// Seed sample data
app.post('/api/seed', async (req, res) => {
    try {
        const sampleCranes = [
            { code:"CRN-2023-001", model:"Tower Crane X-2000", description:"Hydraulic pressure low", severity:"high", steps:[{title:"Check Hydraulic Fluid", description:"Inspect fluid level"},{title:"Check Leaks", description:"Inspect all hydraulic lines"}] },
            { code:"CRN-2023-002", model:"Mobile Crane Y-500", description:"Boom sensor inconsistent", severity:"medium", steps:[{title:"Check Connections", description:"Inspect electrical connections"}] }
        ];
        await Crane.deleteMany({});
        await Crane.insertMany(sampleCranes);
        res.json({ message:'Sample data added' });
    } catch(err){ res.status(500).json({ message: err.message }); }
});

// MongoDB connection & server start
mongoose.connect(process.env.MONGO_URI)
    .then(()=> app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`)))
    .catch(err=> console.error('MongoDB error:', err));
