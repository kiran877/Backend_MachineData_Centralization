// Using native fetch
async function testMachine() {
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

        // 2. Get Lines to link machine
        console.log('\n--- 2. Getting Lines ---');
        const linesRes = await fetch('http://localhost:3000/api/lines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const lines = await linesRes.json();

        if (lines.length === 0) {
            console.log('No lines found. Need to create Line first.');
            // Let's create an area and line for testing
            console.log('Creating Area and Line...');

            // Get Plant ID from test_org.js result (or just query)
            const plantsRes = await fetch('http://localhost:3000/api/plants', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const plants = await plantsRes.json();
            const plantId = plants[0].plant_id;

            const areaRes = await fetch('http://localhost:3000/api/areas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ plant_id: plantId, area_name: 'Main Area' })
            });

            const areasRes = await fetch('http://localhost:3000/api/areas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const areas = await areasRes.json();
            const areaId = areas[0].area_id;

            await fetch('http://localhost:3000/api/lines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ area_id: areaId, line_code: 'L001', line_name: 'Production Line 1' })
            });
        }

        // 3. Create Machine
        console.log('\n--- 3. Creating Machine ---');
        const finalLinesRes = await fetch('http://localhost:3000/api/lines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const finalLines = await finalLinesRes.json();
        const lineId = finalLines[0].line_id;

        const machineData = {
            line_id: lineId,
            machine_code: 'M001',
            machine_name: 'Drilling Machine',
            machine_type: 'CNC',
            automation_type: 'PLC Controlled'
        };
        const createRes = await fetch('http://localhost:3000/api/machines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(machineData)
        });
        console.log('Status:', createRes.status);
        console.log('Response:', await createRes.json());

        // 4. Get Machines
        console.log('\n--- 4. Getting Machines ---');
        const getRes = await fetch('http://localhost:3000/api/machines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const machines = await getRes.json();
        console.log('Machines found:', machines.length);
        console.log(machines);

    } catch (err) {
        console.error('Error:', err);
    }
}

testMachine();
