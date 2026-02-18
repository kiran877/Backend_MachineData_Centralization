const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sql, poolPromise } = require('../config/db');

async function checkCols() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'machines'
        `);
        const columns = result.recordset.map(row => row.COLUMN_NAME);
        console.log('COLUMNS:', columns.join(', '));
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

checkCols();
