const { sql, poolPromise } = require('../config/db');

async function fullSeed() {
    try {
        const pool = await poolPromise;
        console.log('🚀 Starting Full Database Seeding...');

        // 1. Plants
        console.log('Seeding Plants...');
        const plantResult = await pool.request().query("INSERT INTO plants (plant_code, plant_name, location) OUTPUT inserted.plant_id VALUES ('PL01', 'Sanand Engine Plant', 'Gujarat'), ('PL02', 'Pune Chassis Plant', 'Maharashtra')");
        const plantIds = plantResult.recordset.map(r => r.plant_id);

        // 2. Areas
        console.log('Seeding Areas...');
        const areaResult = await pool.request().query(`
            INSERT INTO areas (plant_id, area_name) OUTPUT inserted.area_id VALUES 
            (${plantIds[0]}, 'Machining'), (${plantIds[0]}, 'Assembly'),
            (${plantIds[1]}, 'Welding'), (${plantIds[1]}, 'Paint Shop')
        `);
        const areaIds = areaResult.recordset.map(r => r.area_id);

        // 3. Lines
        console.log('Seeding Lines...');
        const lineResult = await pool.request().query(`
            INSERT INTO lines (area_id, line_code, line_name) OUTPUT inserted.line_id VALUES 
            (${areaIds[0]}, 'M-LINE-01', 'Cylinder Head Line'),
            (${areaIds[0]}, 'M-LINE-02', 'Block Machining Line'),
            (${areaIds[1]}, 'A-LINE-01', 'Final Assembly Line')
        `);
        const lineIds = lineResult.recordset.map(r => r.line_id);

        // 4. Machines
        console.log('Seeding Machines...');
        const machineResult = await pool.request().query(`
            INSERT INTO machines (line_id, machine_code, machine_name, machine_type, automation_type, digitization_status) 
            OUTPUT inserted.machine_id VALUES 
            (${lineIds[0]}, 'CNC-001', 'Vertical Machining Center 1', 'CNC', 'PLC Controlled', 'Fully Digital'),
            (${lineIds[0]}, 'CNC-002', 'Vertical Machining Center 2', 'CNC', 'PLC Controlled', 'Digital Ready'),
            (${lineIds[1]}, 'WASH-01', 'Industrial Washer', 'Washer', 'Manual with Sensors', 'Partial')
        `);
        const machineIds = machineResult.recordset.map(r => r.machine_id);

        // 5. Processes
        console.log('Seeding Processes...');
        const processResult = await pool.request().query(`
            INSERT INTO processes (machine_id, process_name, part_name, cycle_time_seconds) 
            OUTPUT inserted.process_id VALUES 
            (${machineIds[0]}, 'Rough Milling', 'Cylinder Head VX', 45),
            (${machineIds[0]}, 'Finish Boring', 'Cylinder Head VX', 60),
            (${machineIds[2]}, 'Degreasing', 'Engine Block V6', 120)
        `);
        const processIds = processResult.recordset.map(r => r.process_id);

        // 6. Process Parameters
        console.log('Seeding Process Parameters...');
        await pool.request().query(`
            INSERT INTO process_parameters (process_id, parameter_name, unit, control_limit_min, control_limit_max, set_point, alarm_enabled) VALUES 
            (${processIds[0]}, 'Spindle Speed', 'RPM', 800, 3000, 2500, 1),
            (${processIds[0]}, 'Feed Rate', 'mm/min', 100, 500, 400, 1),
            (${processIds[2]}, 'Water Temperature', 'C', 60, 90, 80, 1)
        `);

        // 7. PLCs & HMIs
        console.log('Seeding Hardware...');
        await pool.request().query(`
            INSERT INTO plcs (machine_id, plc_make, plc_model, plc_software_version, plc_firmware_version) VALUES 
            (${machineIds[0]}, 'Siemens', 'S7-1500', 'TIA V17', 'V2.9'),
            (${machineIds[2]}, 'Allen Bradley', 'ControlLogix', 'Studio 5000', 'V33')
        `);
        await pool.request().query(`
            INSERT INTO hmis (machine_id, hmi_make, hmi_model, hmi_ip) VALUES 
            (${machineIds[0]}, 'Siemens', 'TP1200', '192.168.1.10'),
            (${machineIds[2]}, 'Pro-face', 'GP-4501TW', '192.168.1.15')
        `);

        // 8. Protocols (Master already partially seeded, ensuring ones we need)
        console.log('Seeding Protocols...');
        await pool.request().query("IF NOT EXISTS (SELECT 1 FROM protocols WHERE protocol_name = 'Modbus TCP') INSERT INTO protocols (protocol_name, protocol_category, default_port) VALUES ('Modbus TCP', 'Ethernet', 502)");

        const protocols = await pool.request().query("SELECT protocol_id FROM protocols");
        const protoId = protocols.recordset[0].protocol_id;

        await pool.request().query(`INSERT INTO machine_protocols (machine_id, protocol_id, is_primary) VALUES (${machineIds[0]}, ${protoId}, 1)`);

        // 9. PLC Tags
        console.log('Seeding Tags...');
        const tagResult = await pool.request().query(`
            INSERT INTO plc_tags (machine_id, tag_name, plc_address, data_type, engineering_unit, history_enabled) 
            OUTPUT inserted.tag_id VALUES 
            (${machineIds[0]}, 'Motor_Temp', 'DB10.DBD20', 'Float', 'C', 1),
            (${machineIds[0]}, 'Cycle_Count', 'DB10.DBW30', 'Int', 'pcs', 1),
            (${machineIds[2]}, 'Flow_Rate', 'I:1/0', 'Float', 'L/min', 1)
        `);
        const tagIds = tagResult.recordset.map(r => r.tag_id);

        // 10. Alarms
        console.log('Seeding Alarm Configs...');
        await pool.request().query(`
            INSERT INTO tag_alarm_configs (tag_id, alarm_type, threshold, priority, is_enabled) VALUES 
            (${tagIds[0]}, 'High', 85, 2, 1),
            (${tagIds[0]}, 'HighHigh', 95, 1, 1),
            (${tagIds[2]}, 'Low', 5, 2, 1)
        `);

        console.log('✅ Full Seeding Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
}

fullSeed();
