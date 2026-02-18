// Using native fetch
async function testProcess() {
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

        // 2. Get Machines to link process
        console.log('\n--- 2. Getting Machines ---');
        const machinesRes = await fetch('http://localhost:3000/api/machines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const machines = await machinesRes.json();
        const machineId = machines[0].machine_id;

        // 3. Create Process
        console.log('\n--- 3. Creating Process ---');
        const processData = {
            machine_id: machineId,
            process_name: 'Drilling',
            part_name: 'Engine Block',
            cycle_time_seconds: 45
        };
        const createProcRes = await fetch('http://localhost:3000/api/processes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(processData)
        });
        console.log('Process Status:', createProcRes.status);

        // 4. Get Processes to link parameter
        const getProcsRes = await fetch('http://localhost:3000/api/processes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const processes = await getProcsRes.json();
        const processId = processes[0].process_id;

        // 5. Create Parameter
        console.log('\n--- 5. Creating Parameter ---');
        const paramData = {
            process_id: processId,
            parameter_name: 'Drill Speed',
            unit: 'RPM',
            control_limit_min: 500,
            control_limit_max: 2000,
            set_point: 1500,
            alarm_enabled: true
        };
        const createParamRes = await fetch('http://localhost:3000/api/processes/parameters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(paramData)
        });
        console.log('Parameter Status:', createParamRes.status);

        // 6. Get Parameters
        console.log('\n--- 6. Getting Parameters ---');
        const getParamsRes = await fetch(`http://localhost:3000/api/processes/parameters?process_id=${processId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const parameters = await getParamsRes.json();
        console.log('Parameters found:', parameters.length);
        console.log(parameters);

    } catch (err) {
        console.error('Error:', err);
    }
}

testProcess();
