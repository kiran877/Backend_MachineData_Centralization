const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        console.log('[DEBUG] getUsers hit');
        const dbPool = await poolPromise;
        const result = await dbPool.request().query(`
            SELECT u.user_id, u.username, r.role_name, d.department_name, u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            JOIN departments d ON u.department_id = d.department_id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getUsers error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.registerUser = async (req, res) => {
    const { username, password, role_id, department_id, plant_id, line_id } = req.body;
    try {
        console.log('[DEBUG] registerUser hit for:', username);
        const dbPool = await poolPromise;

        // Check if user exists
        const check = await dbPool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT user_id FROM users WHERE username = @username');

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await dbPool.request()
            .input('username', sql.NVarChar, username)
            .input('password_hash', sql.NVarChar, hashedPassword)
            .input('role_id', sql.Int, role_id)
            .input('department_id', sql.Int, department_id)
            .input('plant_id', sql.Int, plant_id || null)
            .input('line_id', sql.Int, line_id || null)
            .query(`
                INSERT INTO users (username, password_hash, role_id, department_id, plant_id, line_id) 
                VALUES (@username, @password_hash, @role_id, @department_id, @plant_id, @line_id)
            `);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('[DEBUG] registerUser error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.getRoles = async (req, res) => {
    try {
        console.log('[DEBUG] getRoles hit');
        const dbPool = await poolPromise;
        const result = await dbPool.request().query('SELECT * FROM roles');
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getRoles error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        console.log('[DEBUG] getDepartments hit');
        const dbPool = await poolPromise;
        const result = await dbPool.request().query('SELECT * FROM departments');
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getDepartments error:', err);
        res.status(500).send({ message: err.message });
    }
};
