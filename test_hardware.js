// Using native fetch
async function testHardware() {
    try {
        // 1. Login
        console.log('--- 1. Logging in ---');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin_test', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Logged in.');

        // 2. Get Machines
        const machinesRes = await fetch('http://localhost:3000/api/machines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const machines = await machinesRes.json();
        const machineId = machines[0].machine_id;

        // 3. Create PLC
        console.log('\n--- 3. Creating PLC ---');
        const plcData = {
            machine_id: machineId,
            plc_make: 'Siemens',
            plc_model: 'S7-1500',
            plc_software_version: 'TIA Portal V17',
            plc_firmware_version: 'V2.9'
        };
        const createPLCRes = await fetch('http://localhost:3000/api/hardware/plcs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(plcData)
        });
        console.log('PLC Status:', createPLCRes.status);

        // 4. Create HMI
        console.log('\n--- 4. Creating HMI ---');
        const hmiData = {
            machine_id: machineId,
            hmi_make: 'Siemens',
            hmi_model: 'TP1200 Comfort',
            hmi_ip: '192.168.0.10'
        };
        const createHMIRes = await fetch('http://localhost:3000/api/hardware/hmis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(hmiData)
        });
        console.log('HMI Status:', createHMIRes.status);

        // 5. Get Hardware
        console.log('\n--- 5. Getting PLCs ---');
        const plcsRes = await fetch('http://localhost:3000/api/hardware/plcs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('PLCs found:', (await plcsRes.json()).length);

        console.log('\n--- 6. Getting HMIs ---');
        const hmisRes = await fetch('http://localhost:3000/api/hardware/hmis', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('HMIs found:', (await hmisRes.json()).length);

    } catch (err) {
        console.error('Error:', err);
    }
}

testHardware();
