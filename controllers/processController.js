const { sql, poolPromise } = require('../config/db');

// --- PROCESSES ---
exports.getProcesses = async (req, res) => {
    const { machine_id } = req.query;
    try {
        console.log('[DEBUG] getProcesses hit', machine_id ? `for machine_id: ${machine_id}` : '');
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = `
            SELECT p.*, m.machine_name 
            FROM processes p
            JOIN machines m ON p.machine_id = m.machine_id
            WHERE p.is_active = 1
        `;

        if (machine_id) {
            query += ' AND p.machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getProcesses error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createProcess = async (req, res) => {
    const { machine_id, process_name, part_name, cycle_time_seconds } = req.body;
    try {
        console.log('[DEBUG] createProcess hit with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('process_name', sql.NVarChar, process_name)
            .input('part_name', sql.NVarChar, part_name)
            .input('cycle_time_seconds', sql.Int, cycle_time_seconds)
            .query(`
                INSERT INTO processes (machine_id, process_name, part_name, cycle_time_seconds) 
                VALUES (@machine_id, @process_name, @part_name, @cycle_time_seconds)
            `);

        // Fetch newly created process_id
        const idResult = await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('process_name', sql.NVarChar, process_name)
            .query('SELECT TOP 1 process_id FROM processes WHERE machine_id = @machine_id AND process_name = @process_name ORDER BY process_id DESC');

        const process_id = idResult.recordset && idResult.recordset[0] ? idResult.recordset[0].process_id : null;

        if (!process_id) {
            console.error('[DEBUG] createProcess failed to retrieve ID');
            return res.status(500).json({ message: 'Failed to retrieve process ID' });
        }

        res.status(201).json({ message: 'Process created successfully', process_id });
    } catch (err) {
        console.error('[DEBUG] createProcess error:', err);
        res.status(500).send({ message: err.message });
    }
};

// --- PARAMETERS ---
exports.getParameters = async (req, res) => {
    const { process_id, machine_id } = req.query;
    try {
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = 'SELECT pp.* FROM process_parameters pp';

        if (machine_id) {
            query += ' JOIN processes p ON pp.process_id = p.process_id WHERE p.machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        } else if (process_id) {
            query += ' WHERE pp.process_id = @process_id';
            request.input('process_id', sql.Int, process_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.createParameter = async (req, res) => {
    const { process_id, parameter_name, unit, control_limit_min, control_limit_max, set_point, alarm_enabled } = req.body;
    try {
        console.log('[DEBUG] createParameter hit with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('process_id', sql.Int, process_id)
            .input('parameter_name', sql.NVarChar, parameter_name)
            .input('unit', sql.NVarChar, unit)
            .input('control_limit_min', sql.Float, control_limit_min)
            .input('control_limit_max', sql.Float, control_limit_max)
            .input('set_point', sql.Float, set_point)
            .input('alarm_enabled', sql.Bit, alarm_enabled)
            .query(`
                INSERT INTO process_parameters (process_id, parameter_name, unit, control_limit_min, control_limit_max, set_point, alarm_enabled) 
                VALUES (@process_id, @parameter_name, @unit, @control_limit_min, @control_limit_max, @set_point, @alarm_enabled)
            `);
        res.status(201).json({ message: 'Process parameter created successfully' });
    } catch (err) {
        console.error('[DEBUG] createParameter error:', err);
        res.status(500).send({ message: err.message });
    }
};
