const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { sql, poolPromise } = require('../config/db');

async function updateSchemaBestPractice() {
    try {
        const pool = await poolPromise;

        console.log('Checking for created_by column...');
        const checkCreated = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'created_by'");
        if (checkCreated.recordset.length === 0) {
            console.log('Adding created_by...');
            await pool.request().query("ALTER TABLE machines ADD created_by INT NULL");
            await pool.request().query("ALTER TABLE machines ADD CONSTRAINT FK_Machines_CreatedBy FOREIGN KEY (created_by) REFERENCES users(user_id)");
        }

        console.log('Checking for updated_by column...');
        const checkUpdated = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_by'");
        if (checkUpdated.recordset.length === 0) {
            console.log('Adding updated_by...');
            await pool.request().query("ALTER TABLE machines ADD updated_by INT NULL");
            await pool.request().query("ALTER TABLE machines ADD CONSTRAINT FK_Machines_UpdatedBy FOREIGN KEY (updated_by) REFERENCES users(user_id)");
        } else {
            // Check if it's INT
            const checkType = await pool.request().query("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_by'");
            if (checkType.recordset[0].DATA_TYPE !== 'int') {
                console.log('WARNING: updated_by exists but is not INT. Please fix manually to avoid data loss.');
            }
        }

        console.log('Checking for updated_at column...');
        const checkAt = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'machines' AND COLUMN_NAME = 'updated_at'");
        if (checkAt.recordset.length === 0) {
            console.log('Adding updated_at...');
            await pool.request().query("ALTER TABLE machines ADD updated_at DATETIME DEFAULT GETDATE()");
        }

        console.log('Schema Best Practice Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error('Schema Update Failed:', err);
        process.exit(1);
    }
}

updateSchemaBestPractice();
