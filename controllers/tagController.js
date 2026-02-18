const { sql, poolPromise } = require('../config/db');

// --- PLC TAGS ---
exports.getTags = async (req, res) => {
    const { machine_id } = req.query;
    try {
        console.log('[DEBUG] getTags hitting backend');
        const dbPool = await poolPromise;
        let query = 'SELECT * FROM plc_tags';
        const request = dbPool.request();

        if (machine_id) {
            query += ' WHERE machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getTags Error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createTag = async (req, res) => {
    const {
        machine_id, tag_name, tag_path, description, data_type, io_type,
        plc_address, engineering_unit, raw_min, raw_max, eng_min, eng_max,
        deadband, history_enabled, security_level
    } = req.body;

    try {
        console.log('[DEBUG] createTag hitting backend with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('tag_name', sql.NVarChar, tag_name)
            .input('tag_path', sql.NVarChar, tag_path)
            .input('description', sql.NVarChar, description)
            .input('data_type', sql.NVarChar, data_type)
            .input('io_type', sql.NVarChar, io_type)
            .input('plc_address', sql.NVarChar, plc_address)
            .input('engineering_unit', sql.NVarChar, engineering_unit)
            .input('raw_min', sql.Float, raw_min)
            .input('raw_max', sql.Float, raw_max)
            .input('eng_min', sql.Float, eng_min)
            .input('eng_max', sql.Float, eng_max)
            .input('deadband', sql.Float, deadband)
            .input('history_enabled', sql.Bit, history_enabled ? 1 : 0)
            .input('security_level', sql.NVarChar, security_level)
            .query(`
                INSERT INTO plc_tags (
                    machine_id, tag_name, tag_path, description, data_type, io_type, 
                    plc_address, engineering_unit, raw_min, raw_max, eng_min, eng_max, 
                    deadband, history_enabled, security_level
                ) 
                VALUES (
                    @machine_id, @tag_name, @tag_path, @description, @data_type, @io_type, 
                    @plc_address, @engineering_unit, @raw_min, @raw_max, @eng_min, @eng_max, 
                    @deadband, @history_enabled, @security_level
                )
            `);

        // Fetch newly created tag_id
        const idResult = await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('tag_name', sql.NVarChar, tag_name)
            .query('SELECT TOP 1 tag_id FROM plc_tags WHERE machine_id = @machine_id AND tag_name = @tag_name ORDER BY tag_id DESC');

        const tag_id = idResult.recordset && idResult.recordset[0] ? idResult.recordset[0].tag_id : null;

        if (!tag_id) {
            return res.status(500).json({ message: 'Failed to retrieve tag ID' });
        }

        res.status(201).json({ message: 'PLC tag created successfully', tag_id });
    } catch (err) {
        console.error('[DEBUG] createTag Error:', err);
        res.status(500).send({ message: err.message });
    }
};

// --- ALARM CONFIGS ---
exports.getAlarmConfigs = async (req, res) => {
    const { tag_id, machine_id } = req.query;
    try {
        console.log('[DEBUG] getAlarmConfigs hit', machine_id ? `for machine_id: ${machine_id}` : '');
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = 'SELECT ac.* FROM tag_alarm_configs ac';

        if (machine_id) {
            query += ' JOIN plc_tags t ON ac.tag_id = t.tag_id WHERE t.machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        } else if (tag_id) {
            query += ' WHERE ac.tag_id = @tag_id';
            request.input('tag_id', sql.Int, tag_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getAlarmConfigs Error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createAlarmConfig = async (req, res) => {
    const { tag_id, alarm_type, threshold, priority, is_enabled } = req.body;
    try {
        console.log('[DEBUG] createAlarmConfig hitting backend');
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('tag_id', sql.Int, tag_id)
            .input('alarm_type', sql.NVarChar, alarm_type)
            .input('threshold', sql.Float, threshold)
            .input('priority', sql.Int, priority)
            .input('is_enabled', sql.Bit, is_enabled)
            .query(`
                INSERT INTO tag_alarm_configs (tag_id, alarm_type, threshold, priority, is_enabled) 
                VALUES (@tag_id, @alarm_type, @threshold, @priority, @is_enabled)
            `);
        res.status(201).json({ message: 'Alarm configuration created successfully' });
    } catch (err) {
        console.error('[DEBUG] createAlarmConfig Error:', err);
        res.status(500).send({ message: err.message });
    }
};
