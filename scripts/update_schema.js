const path = require('path');
const dotenv = require('dotenv');
// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { sql, poolPromise } = require('../config/db');

async function updateSchema() {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        console.log('Checking columns...');

        // Check updated_by
        const checkByProxy = await pool.request().query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_by'
        `);

        if (checkByProxy.recordset.length === 0) {
            console.log('Adding updated_by column...');
            await pool.request().query("ALTER TABLE machines ADD updated_by INT NULL");
            console.log('Values: updated_by added.');
        } else {
            console.log('updated_by already exists.');
        }

        // Check updated_at
        const checkAtProxy = await pool.request().query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_at'
        `);

        if (checkAtProxy.recordset.length === 0) {
            console.log('Adding updated_at column...');
            await pool.request().query("ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE()");
            console.log('Values: updated_at added.');
        } else {
            console.log('updated_at already exists.');
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Schema Update Failed:', err);
        process.exit(1);
    }
}

updateSchema();
