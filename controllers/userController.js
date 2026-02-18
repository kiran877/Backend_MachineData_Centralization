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
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        console.log('[DEBUG] deleteUser hit for id:', id);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM users WHERE user_id = @id');
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('[DEBUG] deleteUser error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role_id, department_id, plant_id, line_id, password } = req.body;
    try {
        console.log('[DEBUG] updateUser hit for id:', id);
        const dbPool = await poolPromise;

        let query = `
            UPDATE users 
            SET username = @username, 
                role_id = @role_id, 
                department_id = @department_id, 
                plant_id = @plant_id, 
                line_id = @line_id
        `;

        const request = dbPool.request()
            .input('id', sql.Int, id)
            .input('username', sql.NVarChar, username)
            .input('role_id', sql.Int, role_id)
            .input('department_id', sql.Int, department_id)
            .input('plant_id', sql.Int, plant_id || null)
            .input('line_id', sql.Int, line_id || null);

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += `, password_hash = @password_hash`;
            request.input('password_hash', sql.NVarChar, hashedPassword);
        }

        query += ` WHERE user_id = @id`;

        await request.query(query);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('[DEBUG] updateUser error:', err);
        res.status(500).send({ message: err.message });
    }
};
