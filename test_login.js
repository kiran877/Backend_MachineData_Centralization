// Using native fetch

// Node 18+ has native fetch. Let's try native fetch first.
async function testLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin_test',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.status === 200 && data.token) {
            console.log('✅ Login Successful');
        } else {
            console.log('❌ Login Failed');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

testLogin();
