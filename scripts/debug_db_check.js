const path = require('path');
const dotenv = require('dotenv');
// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { sql, poolPromise } = require('../config/db');

async function checkQuery() {
    try {
        const pool = await poolPromise;
        console.log('Running getMachines query...');
        const result = await pool.request().query(`
            SELECT m.*, l.line_name, a.area_name, p.plant_name, u.username as updated_by_username
            FROM machines m
            JOIN lines l ON m.line_id = l.line_id
            JOIN areas a ON l.area_id = a.area_id
            JOIN plants p ON a.plant_id = p.plant_id
            LEFT JOIN users u ON m.updated_by = u.user_id
            WHERE m.is_active = 1
        `);
        console.log('Query Successful. Rows:', result.recordset.length);
        process.exit(0);
    } catch (err) {
        console.error('Query Failed with Error:');
        console.error(err.message); // Print message clearly
        console.error('--- Full Error ---');
        console.error(err);
        process.exit(1);
    }
}

checkQuery();
