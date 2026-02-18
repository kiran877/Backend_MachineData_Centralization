// Using native fetch
async function testOrg() {
    try {
        // 1. Login
        console.log('--- 1. Logging in ---');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin_test', password: 'password123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.token) {
            console.error('Login Failed', loginData);
            return;
        }
        const token = loginData.token;
        console.log('✅ Logged in. Token received.');

        // 2. Create Plant
        console.log('\n--- 2. Creating Plant ---');
        const plantData = {
            plant_code: 'P001',
            plant_name: 'Test Plant 1',
            location: 'Hyderabad'
        };
        const createRes = await fetch('http://localhost:3000/api/plants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(plantData)
        });
        const createData = await createRes.json();
        console.log('Status:', createRes.status);
        console.log('Response:', createData);

        // 3. Get Plants
        console.log('\n--- 3. Getting Plants ---');
        const getRes = await fetch('http://localhost:3000/api/plants', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();
        console.log('Status:', getRes.status);
        console.log('Plants found:', getData.length);
        console.log(getData);

    } catch (err) {
        console.error('Error:', err);
    }
}

testOrg();
