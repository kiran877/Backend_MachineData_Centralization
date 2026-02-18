const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('../config/db');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('[DEBUG] Login hit for user:', username);
        const dbPool = await poolPromise;
        const result = await dbPool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT u.user_id, u.username, u.password_hash, u.role_id, r.role_name, 
                       u.department_id, d.department_name, u.plant_id
                FROM users u
                INNER JOIN roles r ON u.role_id = r.role_id
                INNER JOIN departments d ON u.department_id = d.department_id
                WHERE u.username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials or inactive user' });
        }

        const user = result.recordset[0];

        // In a real app, use bcrypt.compare. For this existing DB (assuming plain text or hash match needed logic)
        // If password stored is hash: const isMatch = await bcrypt.compare(password, user.password_hash);
        // FOR NOW: Assuming the user provided 'password_hash' in Schema2 might be plain text or specific hash.
        // Let's assume standard bcrypt for new system. If legacy, we might need a check.
        // Given 'password_hash' column name, I will try bcrypt compare first.

        // NOTE: Since we are starting fresh with data, let's assume valid bcrypt hashes are stored.
        // If the user manually inserted plain text in DB, this might fail. 
        // Let's handle both for dev convenience if needed, but Stick to Security Best Practice.

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role_name,
                role_id: user.role_id,
                dept_id: user.department_id,
                plant_id: user.plant_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role_name,
                department: user.department_name
            }
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
