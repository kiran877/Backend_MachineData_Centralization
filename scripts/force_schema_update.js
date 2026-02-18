const path = require('path');
const dotenv = require('dotenv');
// Load env from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const { sql, poolPromise } = require('../config/db');

async function forceUpdate() {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        console.log('Attempting to add updated_by...');
        try {
            await pool.request().query("ALTER TABLE machines ADD updated_by INT NULL");
            console.log('SUCCESS: updated_by added.');
        } catch (err) {
            console.log('INFO: Could not add updated_by (likely exists).');
        }

        console.log('Attempting to add updated_at...');
        try {
            await pool.request().query("ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE()");
            console.log('SUCCESS: updated_at added.');
        } catch (err) {
            console.log('INFO: Could not add updated_at (likely exists).');
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal Script Error:', err);
        process.exit(1);
    }
}

forceUpdate();
