const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Routes - Specifiic resource routes MUST come before the general /api orgRoutes
app.use('/api/auth', authRoutes);
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/processes', require('./routes/processRoutes'));
app.use('/api/hardware', require('./routes/hardwareRoutes'));
app.use('/api/protocols', require('./routes/protocolRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Organization routes (Plants, Areas, Lines)
app.use('/api', require('./routes/orgRoutes'));

// Health Check
app.get('/', (req, res) => {
    res.send('Manufacturing Backend API is Running');
});

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    try {
        await poolPromise;
        console.log('✅ Database connection verified on startup');
    } catch (err) {
        console.error('❌ Database connection error on startup:', err);
    }
});
