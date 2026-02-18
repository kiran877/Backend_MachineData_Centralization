// Using native fetch
async function testTag() {
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

        // 2. Get Machine
        const machinesRes = await fetch('http://localhost:3000/api/machines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const machines = await machinesRes.json();
        const machineId = machines[0].machine_id;

        // 3. Create Tag
        console.log('\n--- 3. Creating Tag ---');
        const tagData = {
            machine_id: machineId,
            tag_name: 'Temperature_Main',
            tag_path: 'Machines/M001/Sensors/Temp',
            description: 'Main Bearing Temperature',
            data_type: 'Float',
            io_type: 'Input',
            plc_address: 'DB10.DBD20',
            engineering_unit: 'C',
            raw_min: 0,
            raw_max: 27648,
            eng_min: 0,
            eng_max: 100,
            deadband: 0.5,
            history_enabled: true,
            security_level: 'Standard'
        };
        const createTagRes = await fetch('http://localhost:3000/api/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(tagData)
        });
        console.log('Tag Status:', createTagRes.status);

        // 4. Get Tags to link alarm
        const getTagsRes = await fetch(`http://localhost:3000/api/tags?machine_id=${machineId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tags = await getTagsRes.json();
        const tagId = tags[0].tag_id;

        // 5. Create Alarm
        console.log('\n--- 5. Creating Alarm ---');
        const alarmData = {
            tag_id: tagId,
            alarm_type: 'HighHigh',
            threshold: 95,
            priority: 1,
            is_enabled: true
        };
        const createAlarmRes = await fetch('http://localhost:3000/api/tags/alarms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(alarmData)
        });
        console.log('Alarm Status:', createAlarmRes.status);

        // 6. Get Alarms
        console.log('\n--- 6. Getting Alarms ---');
        const getAlarmsRes = await fetch(`http://localhost:3000/api/tags/alarms?tag_id=${tagId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const alarms = await getAlarmsRes.json();
        console.log('Alarms found:', alarms.length);
        console.log(alarms);

    } catch (err) {
        console.error('Error:', err);
    }
}

testTag();
