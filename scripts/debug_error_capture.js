const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sql, poolPromise } = require('../config/db');

async function debugError() {
    try {
        const pool = await poolPromise;
        console.log('--- START DEBUG ---');

        // 1. Check Schema Types explicitly
        console.log('Checking Schema Types...');
        const schema = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'machines' 
            AND COLUMN_NAME IN ('created_by', 'updated_by')
        `);
        console.log(JSON.stringify(schema.recordset, null, 2));

        // 2. Run Query
        console.log('Running Query...');
        const result = await pool.request().query(`
            SELECT m.*, l.line_name, a.area_name, p.plant_name, u.username as updated_by_username
            FROM machines m
            JOIN lines l ON m.line_id = l.line_id
            JOIN areas a ON l.area_id = a.area_id
            JOIN plants p ON a.plant_id = p.plant_id
            LEFT JOIN users u ON m.updated_by = u.user_id
            WHERE m.is_active = 1
        `);
        console.log('Query Success. Rows:', result.recordset.length);

    } catch (err) {
        console.log('!!! ERROR CAUGHT !!!');
        console.log('Message:', err.message);
        console.log('Code:', err.code);
        if (err.originalError) {
            console.log('Original Info:', err.originalError.info);
        }
    } finally {
        console.log('--- END DEBUG ---');
        process.exit(0);
    }
}

debugError();
