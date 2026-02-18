const { sql, poolPromise } = require('../config/db');

// --- PLCs ---
exports.getPLCs = async (req, res) => {
    const { machine_id } = req.query;
    try {
        console.log('[DEBUG] getPLCs hit', machine_id ? `for machine_id: ${machine_id}` : '');
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = `
            SELECT p.*, m.machine_name 
            FROM plcs p
            JOIN machines m ON p.machine_id = m.machine_id
        `;

        if (machine_id) {
            query += ' WHERE p.machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getPLCs error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createPLC = async (req, res) => {
    const { machine_id, plc_make, plc_model, plc_software_version, plc_firmware_version } = req.body;
    try {
        console.log('[DEBUG] createPLC hit with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('plc_make', sql.NVarChar, plc_make)
            .input('plc_model', sql.NVarChar, plc_model)
            .input('plc_software_version', sql.NVarChar, plc_software_version)
            .input('plc_firmware_version', sql.NVarChar, plc_firmware_version)
            .query(`
                INSERT INTO plcs (machine_id, plc_make, plc_model, plc_software_version, plc_firmware_version) 
                VALUES (@machine_id, @plc_make, @plc_model, @plc_software_version, @plc_firmware_version)
            `);
        res.status(201).json({ message: 'PLC created successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updatePLC = async (req, res) => {
    const { id } = req.params;
    const { plc_make, plc_model, plc_software_version, plc_firmware_version } = req.body;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .input('plc_make', sql.NVarChar, plc_make)
            .input('plc_model', sql.NVarChar, plc_model)
            .input('plc_software_version', sql.NVarChar, plc_software_version)
            .input('plc_firmware_version', sql.NVarChar, plc_firmware_version)
            .query(`
                UPDATE plcs 
                SET plc_make = @plc_make, 
                    plc_model = @plc_model, 
                    plc_software_version = @plc_software_version, 
                    plc_firmware_version = @plc_firmware_version
                WHERE plc_id = @id
            `);
        res.json({ message: 'PLC updated successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deletePLC = async (req, res) => {
    const { id } = req.params;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM plcs WHERE plc_id = @id');
        res.json({ message: 'PLC deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// --- HMIs ---
exports.getHMIs = async (req, res) => {
    const { machine_id } = req.query;
    try {
        // console.log('[DEBUG] getHMIs hit', machine_id ? `for machine_id: ${machine_id}` : '');
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = `
            SELECT h.*, m.machine_name 
            FROM hmis h
            JOIN machines m ON h.machine_id = m.machine_id
        `;

        if (machine_id) {
            query += ' WHERE h.machine_id = @machine_id';
            request.input('machine_id', sql.Int, machine_id);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getHMIs error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createHMI = async (req, res) => {
    const { machine_id, hmi_make, hmi_model, hmi_ip } = req.body;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('machine_id', sql.Int, machine_id)
            .input('hmi_make', sql.NVarChar, hmi_make)
            .input('hmi_model', sql.NVarChar, hmi_model)
            .input('hmi_ip', sql.NVarChar, hmi_ip)
            .query(`
                INSERT INTO hmis (machine_id, hmi_make, hmi_model, hmi_ip) 
                VALUES (@machine_id, @hmi_make, @hmi_model, @hmi_ip)
            `);
        res.status(201).json({ message: 'HMI created successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateHMI = async (req, res) => {
    const { id } = req.params;
    const { hmi_make, hmi_model, hmi_ip } = req.body;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .input('hmi_make', sql.NVarChar, hmi_make)
            .input('hmi_model', sql.NVarChar, hmi_model)
            .input('hmi_ip', sql.NVarChar, hmi_ip)
            .query(`
                UPDATE hmis 
                SET hmi_make = @hmi_make, 
                    hmi_model = @hmi_model, 
                    hmi_ip = @hmi_ip
                WHERE hmi_id = @id
            `);
        res.json({ message: 'HMI updated successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deleteHMI = async (req, res) => {
    const { id } = req.params;
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM hmis WHERE hmi_id = @id');
        res.json({ message: 'HMI deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
