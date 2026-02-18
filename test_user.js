// Using native fetch
async function testUser() {
    try {
        // 1. Login as Admin
        console.log('--- 1. Logging in as Admin ---');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin_test', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Logged in.');

        // 2. Get Roles and Departments
        console.log('\n--- 2. Getting Roles & Depts ---');
        const rolesRes = await fetch('http://localhost:3000/api/users/roles', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const roles = await rolesRes.json();
        const roleId = roles.find(r => r.role_name === 'Supervisor').role_id;

        const deptsRes = await fetch('http://localhost:3000/api/users/departments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const depts = await deptsRes.json();
        const deptId = depts[0].department_id;

        // 3. Register New User
        console.log('\n--- 3. Registering New User ---');
        const userData = {
            username: 'supervisor_test',
            password: 'password123',
            role_id: roleId,
            department_id: deptId
        };
        const regRes = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(userData)
        });
        console.log('Register Status:', regRes.status);
        console.log('Response:', await regRes.json());

        // 4. Get All Users
        console.log('\n--- 4. Getting All Users ---');
        const usersRes = await fetch('http://localhost:3000/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await usersRes.json();
        console.log('Users found:', users.length);
        console.log(users);

    } catch (err) {
        console.error('Error:', err);
    }
}

testUser();
