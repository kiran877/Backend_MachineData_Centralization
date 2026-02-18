const { sql, poolPromise } = require('../config/db');

async function seedData() {
    try {
        const pool = await poolPromise;

        // 1. Seed Roles
        console.log('Seeding Roles...');
        const roles = ['Admin', 'Manager', 'Supervisor', 'Operator', 'Plant Head'];
        for (const role of roles) {
            const check = await pool.request().query(`SELECT role_id FROM roles WHERE role_name = '${role}'`);
            if (check.recordset.length === 0) {
                await pool.request().query(`INSERT INTO roles (role_name) VALUES ('${role}')`);
                console.log(`+ Role Created: ${role}`);
            } else {
                console.log(`= Role Exists: ${role}`);
            }
        }

        // 2. Seed Departments
        console.log('Seeding Departments...');
        const depts = [
            { code: 'IT', name: 'IT' },
            { code: 'PROD', name: 'Production' },
            { code: 'MAINT', name: 'Maintenance' },
            { code: 'QUALITY', name: 'Quality' }
        ];

        for (const dept of depts) {
            const check = await pool.request().query(`SELECT department_id FROM departments WHERE department_code = '${dept.code}'`);
            if (check.recordset.length === 0) {
                await pool.request().query(`INSERT INTO departments (department_code, department_name) VALUES ('${dept.code}', '${dept.name}')`);
                console.log(`+ Dept Created: ${dept.name}`);
            } else {
                console.log(`= Dept Exists: ${dept.name}`);
            }
        }

        console.log('✅ Seeding Complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
}

seedData();
