const { sql, poolPromise } = require('../config/db');

// --- PROTOCOLS (Master List) ---
exports.getProtocols = async (req, res) => {
    try {
        console.log('[DEBUG] getProtocols hit');
        const dbPool = await poolPromise;
        const result = await dbPool.request().query('SELECT * FROM protocols');
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getProtocols error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createProtocol = async (req, res) => {
    const { protocol_name, protocol_category, default_port } = req.body;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('protocol_name', sql.NVarChar, protocol_name)
            .input('protocol_category', sql.NVarChar, protocol_category)
            .input('default_port', sql.Int, default_port)
            .query(`
                INSERT INTO protocols (protocol_name, protocol_category, default_port) 
                VALUES (@protocol_name, @protocol_category, @default_port)
            `);
        res.status(201).json({ message: 'Protocol created successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- MACHINE PROTOCOLS (Links) ---
exports.getMachineProtocols = async (req, res) => {
    const { machine_id } = req.query;
    try {
        const dbPool = await poolPromise;
        let query = `
            SELECT mp.*, p.protocol_name, p.default_port, p.protocol_category 
            FROM machine_protocols mp
            JOIN protocols p ON mp.protocol_id = p.protocol_id
        `;
        const request = dbPool.request();

        if (machine_id) {
            query += ' WHERE machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.linkMachineProtocol = async (req, res) => {
    const { machine_id, protocol_id, is_primary } = req.body;
    try {
        console.log('[DEBUG] linkMachineProtocol hit with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('protocol_id', sql.Int, protocol_id)
            .input('is_primary', sql.Bit, is_primary)
            .query(`
                INSERT INTO machine_protocols (machine_id, protocol_id, is_primary) 
                VALUES (@machine_id, @protocol_id, @is_primary)
            `);
        res.status(201).json({ message: 'Machine protocol linked successfully' });
    } catch (err) {
        console.error('[DEBUG] linkMachineProtocol error:', err);
        res.status(500).send({ message: err.message });
    }
};
