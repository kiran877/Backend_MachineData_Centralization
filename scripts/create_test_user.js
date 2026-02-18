const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    try {
        const pool = await poolPromise;

        // Hashing password 'password123'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        console.log('Hashed Password:', hashedPassword);

        // Check if role 'Admin' exists, if not assume ID 1 (based on schema insert)
        // Check if department 'IT' exists, if not assume ID 4 

        // Insert User
        // Note: Using raw IDs for simplicity based on standard seed data in Schema.sql
        // Roles: 5 = Admin, Dept: 5 = DSI (or 4 IT)

        // Let's first get Role ID for Admin
        const roleRes = await pool.request().query("SELECT role_id FROM roles WHERE role_name = 'Admin'");
        const roleId = roleRes.recordset[0]?.role_id || 5; // Default to 5 from seed

        // Get Dept ID
        const deptRes = await pool.request().query("SELECT department_id FROM departments WHERE department_code = 'IT'");
        const deptId = deptRes.recordset[0]?.department_id || 4; // Default to 4

        const query = `
            INSERT INTO users (username, password_hash, role_id, department_id)
            VALUES ('admin_test', @password_hash, @role_id, @dept_id)
        `;

        await pool.request()
            .input('password_hash', sql.NVarChar, hashedPassword)
            .input('role_id', sql.Int, roleId)
            .input('dept_id', sql.Int, deptId)
            .query(query);

        console.log('✅ Test User Created: admin_test / password123');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error creating user:', err);
        process.exit(1);
    }
}

createTestUser();
