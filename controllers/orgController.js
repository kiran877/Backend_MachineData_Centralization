const { sql, poolPromise } = require('../config/db');

// --- PLANTS ---
exports.getPlants = async (req, res) => {
    try {
        console.log('[DEBUG] getPlants hit');
        const dbPool = await poolPromise;
        const result = await dbPool.request().query('SELECT * FROM plants WHERE is_active = 1');
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getPlants error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createPlant = async (req, res) => {
    const { plant_code, plant_name, location } = req.body;
    try {
        console.log('[DEBUG] createPlant hit with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('plant_code', sql.NVarChar, plant_code)
            .input('plant_name', sql.NVarChar, plant_name)
            .input('location', sql.NVarChar, location)
            .query(`INSERT INTO plants (plant_code, plant_name, location) VALUES (@plant_code, @plant_name, @location)`);
        res.status(201).json({ message: 'Plant created successfully' });
    } catch (err) {
        console.error('[DEBUG] createPlant error:', err);
        res.status(500).send({ message: err.message });
    }
};

// --- AREAS ---
exports.getAreas = async (req, res) => {
    const targetPlantId = req.query.plant_id;
    try {
        console.log('[DEBUG] getAreas hit for plant_id:', targetPlantId);
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = `
            SELECT a.*, p.plant_name 
            FROM areas a
            JOIN plants p ON a.plant_id = p.plant_id
            WHERE a.is_active = 1 AND p.is_active = 1
        `;

        if (targetPlantId && targetPlantId !== 'undefined' && targetPlantId !== 'null' && targetPlantId !== '') {
            query += ` AND a.plant_id = @p_id_strict`;
            request.input('p_id_strict', sql.Int, targetPlantId);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getAreas error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createArea = async (req, res) => {
    const { plant_id, area_name } = req.body;
    console.log(`[POST /areas] Creating area: ${area_name} for plant: ${plant_id}`);
    if (!plant_id) return res.status(400).json({ message: 'plant_id is required' });
    try {
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('plant_id', sql.Int, plant_id)
            .input('area_name', sql.NVarChar, area_name)
            .query(`INSERT INTO areas (plant_id, area_name) VALUES (@plant_id, @area_name)`);
        res.status(201).json({ message: 'Area created successfully' });
    } catch (err) {
        console.error('Error in createArea:', err);
        res.status(500).send({ message: err.message });
    }
};

// --- LINES ---
exports.getLines = async (req, res) => {
    const targetPlantId = req.query.plant_id;
    const targetAreaId = req.query.area_id;
    try {
        console.log('[DEBUG] getLines hit for plant:', targetPlantId, 'area:', targetAreaId);
        const dbPool = await poolPromise;
        const request = dbPool.request();
        let query = `
            SELECT l.*, a.area_name, p.plant_name
            FROM lines l
            JOIN areas a ON l.area_id = a.area_id
            JOIN plants p ON a.plant_id = p.plant_id
            WHERE l.is_active = 1
        `;

        let isFiltered = false;
        if (targetPlantId && targetPlantId !== 'undefined' && targetPlantId !== 'null' && targetPlantId !== '') {
            query += ` AND a.plant_id = @pid_strict`;
            request.input('pid_strict', sql.Int, targetPlantId);
            isFiltered = true;
        }
        if (targetAreaId && targetAreaId !== 'undefined' && targetAreaId !== 'null' && targetAreaId !== '') {
            query += ` AND l.area_id = @aid_strict`;
            request.input('aid_strict', sql.Int, targetAreaId);
            isFiltered = true;
        }

        if (!isFiltered && (req.query.hasOwnProperty('plant_id') || req.query.hasOwnProperty('area_id'))) {
            return res.json([]);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('[DEBUG] getLines error:', err);
        res.status(500).send({ message: err.message });
    }
};

exports.createLine = async (req, res) => {
    const { area_id, line_code, line_name } = req.body;
    try {
        console.log('[DEBUG] createLine hit with payload:', req.body);
        const dbPool = await poolPromise;
        await dbPool.request()
            .input('area_id', sql.Int, area_id)
            .input('line_code', sql.NVarChar, line_code)
            .input('line_name', sql.NVarChar, line_name)
            .query(`INSERT INTO lines (area_id, line_code, line_name) VALUES (@area_id, @line_code, @line_name)`);
        res.status(201).json({ message: 'Line created successfully' });
    } catch (err) {
        console.error('[DEBUG] createLine error:', err);
        res.status(500).send({ message: err.message });
    }
};
