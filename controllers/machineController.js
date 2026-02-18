const { sql, poolPromise } = require('../config/db');

exports.getMachines = async (req, res) => {
    const { plant_id, area_id, line_id } = req.query;
    try {
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = `
            SELECT m.*, l.line_name, a.area_name, p.plant_name 
            FROM machines m
            JOIN lines l ON m.line_id = l.line_id
            JOIN areas a ON l.area_id = a.area_id
            JOIN plants p ON a.plant_id = p.plant_id
            WHERE m.is_active = 1
        `;

        if (plant_id && plant_id !== 'undefined' && plant_id !== 'null') {
            query += ` AND p.plant_id = @plant_id`;
            request.input('plant_id', sql.Int, plant_id);
        }
        if (area_id && area_id !== 'undefined' && area_id !== 'null') {
            query += ` AND a.area_id = @area_id`;
            request.input('area_id', sql.Int, area_id);
        }
        if (line_id && line_id !== 'undefined' && line_id !== 'null') {
            query += ` AND m.line_id = @line_id`;
            request.input('line_id', sql.Int, line_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getMachineById = async (req, res) => {
    const { id } = req.params;
    try {
        const dbPool = await poolPromise;
        const result = await dbPool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT m.*, l.line_name, a.area_name, p.plant_name 
                FROM machines m
                JOIN lines l ON m.line_id = l.line_id
                JOIN areas a ON l.area_id = a.area_id
                JOIN plants p ON a.plant_id = p.plant_id
                WHERE m.machine_id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Machine not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.createMachine = async (req, res) => {
    const { line_id, machine_code, machine_name, machine_type, automation_type } = req.body;
    try {
        const dbPool = await poolPromise;

        // 1. Create the machine
        await dbPool.request()
            .input('line_id', sql.Int, line_id)
            .input('machine_code', sql.NVarChar, machine_code)
            .input('machine_name', sql.NVarChar, machine_name)
            .input('machine_type', sql.NVarChar, machine_type)
            .input('automation_type', sql.NVarChar, automation_type)
            .query(`
                INSERT INTO machines (line_id, machine_code, machine_name, machine_type, automation_type) 
                VALUES (@line_id, @machine_code, @machine_name, @machine_type, @automation_type)
            `);

        // 2. Explicitly fetch the ID of the newly created machine using the unique machine_code
        const idResult = await dbPool.request()
            .input('machine_code', sql.NVarChar, machine_code)
            .query('SELECT machine_id FROM machines WHERE machine_code = @machine_code');

        const machine_id = idResult.recordset && idResult.recordset[0] ? idResult.recordset[0].machine_id : null;

        if (!machine_id) {
            return res.status(500).json({ message: 'Machine created, but failed to retrieve its ID.' });
        }

        res.status(201).json({ message: 'Machine created successfully', machine_id });
    } catch (err) {
        console.error('SQL Error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.updateMachine = async (req, res) => {
    const { id } = req.params;
    const { machine_name, machine_type, automation_type, digitization_status } = req.body;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .input('machine_name', sql.NVarChar, machine_name)
            .input('machine_type', sql.NVarChar, machine_type)
            .input('automation_type', sql.NVarChar, automation_type)
            .input('digitization_status', sql.NVarChar, digitization_status)
            .query(`
                UPDATE machines 
                SET machine_name = @machine_name, 
                    machine_type = @machine_type, 
                    automation_type = @automation_type,
                    digitization_status = @digitization_status
                WHERE machine_id = @id
            `);
        res.json({ message: 'Machine updated successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deleteMachine = async (req, res) => {
    const { id } = req.params;
    // Role Middleware already handles permission (Supervisor cannot delete)
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .query('UPDATE machines SET is_active = 0 WHERE machine_id = @id');
        res.json({ message: 'Machine deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
