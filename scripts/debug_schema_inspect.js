const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sql, poolPromise } = require('../config/db');

async function inspectSchema() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'machines'
        `);
        console.table(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error('Inspection Failed:', err);
        process.exit(1);
    }
}

inspectSchema();
