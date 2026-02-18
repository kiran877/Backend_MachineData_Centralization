const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sql, poolPromise } = require('../config/db');

async function fixSchema() {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // 1. created_by
        console.log('--- created_by ---');
        try {
            // Try to add it. If it exists, SQL will error.
            await pool.request().query("ALTER TABLE machines ADD created_by INT NULL");
            console.log('Added created_by column.');
        } catch (e) { console.log('created_by likely exists.'); }

        try {
            await pool.request().query("ALTER TABLE machines ADD CONSTRAINT FK_Machines_CreatedBy FOREIGN KEY (created_by) REFERENCES users(user_id)");
            console.log('Added FK_Machines_CreatedBy.');
        } catch (e) { console.log('FK_Machines_CreatedBy likely exists.'); }

        // 2. updated_by
        console.log('--- updated_by ---');
        try {
            await pool.request().query("ALTER TABLE machines ADD updated_by INT NULL");
            console.log('Added updated_by column.');
        } catch (e) { console.log('updated_by likely exists.'); }

        // Check if it is INT
        try {
            const typeCheck = await pool.request().query("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_by'");
            if (typeCheck.recordset.length > 0 && typeCheck.recordset[0].DATA_TYPE !== 'int') {
                console.log('CRITICAL: updated_by is NOT INT. Dropping and Recreating...');
                await pool.request().query("ALTER TABLE machines DROP COLUMN updated_by");
                await pool.request().query("ALTER TABLE machines ADD updated_by INT NULL");
                console.log('Recreated updated_by as INT.');
            }
        } catch (e) { console.log('Error checking/Fixing updated_by type:', e.message); }

        try {
            await pool.request().query("ALTER TABLE machines ADD CONSTRAINT FK_Machines_UpdatedBy FOREIGN KEY (updated_by) REFERENCES users(user_id)");
            console.log('Added FK_Machines_UpdatedBy.');
        } catch (e) { console.log('FK_Machines_UpdatedBy likely exists.'); }

        // 3. updated_at
        console.log('--- updated_at ---');
        try {
            await pool.request().query("ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE()");
            console.log('Added updated_at column.');
        } catch (e) { console.log('updated_at likely exists.'); }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Fix Failed:', err);
        process.exit(1);
    }
}

fixSchema();
