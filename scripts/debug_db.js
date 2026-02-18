const { poolPromise } = require('../config/db');

async function debug() {
    try {
        const pool = await poolPromise;
        console.log('--- TABLES ---');
        const tables = await pool.request().query("SELECT name FROM sys.tables");
        console.table(tables.recordset);

        console.log('--- PLCs Columns ---');
        const plcsCols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'plcs'");
        console.table(plcsCols.recordset);

        console.log('--- HMIs Columns ---');
        const hmisCols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'hmis'");
        console.table(hmisCols.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
