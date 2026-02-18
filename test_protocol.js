// Using native fetch
async function testProtocol() {
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

        // 2. Create Protocol
        console.log('\n--- 2. Creating Protocol ---');
        const protocolData = {
            protocol_name: 'OPC UA',
            protocol_category: 'Industrial Ethernet',
            default_port: 4840
        };
        const createProtoRes = await fetch('http://localhost:3000/api/protocols', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(protocolData)
        });
        console.log('Protocol Status:', createProtoRes.status);

        // 3. Get Protocols to link
        const getProtosRes = await fetch('http://localhost:3000/api/protocols', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const protocols = await getProtosRes.json();
        const protocolId = protocols[0].protocol_id;

        // 4. Get Machine
        const machinesRes = await fetch('http://localhost:3000/api/machines', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const machines = await machinesRes.json();
        const machineId = machines[0].machine_id;

        // 5. Link Protocol to Machine
        console.log('\n--- 5. Linking Protocol ---');
        const linkData = {
            machine_id: machineId,
            protocol_id: protocolId,
            is_primary: true
        };
        const linkRes = await fetch('http://localhost:3000/api/protocols/machine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(linkData)
        });
        console.log('Link Status:', linkRes.status);

        // 6. Get Linked Protocols
        console.log('\n--- 6. Getting Linked Protocols ---');
        const getLinksRes = await fetch(`http://localhost:3000/api/protocols/machine?machine_id=${machineId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const links = await getLinksRes.json();
        console.log('Links found:', links.length);
        console.log(links);

    } catch (err) {
        console.error('Error:', err);
    }
}

testProtocol();
