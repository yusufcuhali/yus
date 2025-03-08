window.MOCK_USERS = [
    {
        id: '1',
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    }
];

async function login(username, password) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = window.MOCK_USERS.find(u => 
            u.username === username && u.password === password
        );

        if (!user) {
            throw new Error('Geçersiz kullanıcı adı veya şifre');
        }

        // Create mock token
        const token = btoa(JSON.stringify({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));

        localStorage.setItem('token', token);
        return {
            token,
            user: {
                name: user.name,
                role: user.role
            }
        };
    } catch (error) {
        reportError(error);
        throw error;
    }
}

async function logout() {
    try {
        localStorage.removeItem('token');
    } catch (error) {
        reportError(error);
        throw error;
    }
}

function getAuthToken() {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        reportError(error);
        return null;
    }
}
