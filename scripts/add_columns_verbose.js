const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sql, poolPromise } = require('../config/db');

async function verboseAdd() {
    let pool;
    try {
        pool = await poolPromise;
        console.log('Connected.');

        // 1. updated_by
        console.log('Attempting to add updated_by...');
        try {
            await pool.request().query("ALTER TABLE machines ADD updated_by INT NULL");
            console.log('SUCCESS: updated_by added.');
        } catch (err) {
            console.error('FAILURE adding updated_by:', err.message);
        }

        // 2. updated_at
        console.log('Attempting to add updated_at...');
        try {
            await pool.request().query("ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE()");
            console.log('SUCCESS: updated_at added.');
        } catch (err) {
            console.error('FAILURE adding updated_at:', err.message);
        }

        // 3. created_by
        console.log('Attempting to add created_by...');
        try {
            await pool.request().query("ALTER TABLE machines ADD created_by INT NULL");
            console.log('SUCCESS: created_by added.');
        } catch (err) {
            console.error('FAILURE adding created_by:', err.message);
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err);
        process.exit(1);
    }
}

verboseAdd();
