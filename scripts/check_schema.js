const { sql, poolPromise } = require('../config/db');

async function checkSchema() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'machines'
        `);
        console.log('--- Machines Table Columns ---');
        console.table(result.recordset);
        console.log('------------------------------');
        process.exit(0);
    } catch (err) {
        console.error('Schema Check Failed:', err);
        process.exit(1);
    }
}

checkSchema();
