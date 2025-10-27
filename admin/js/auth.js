import { post, get } from './api_service.js';

const JWT_KEY = 'jwt_token';
const USER_KEY = 'current_user';

export async function login(email, password) {
    const data = await post('auth/login.php', { email, password });
    if (data.success && data.token) {
        localStorage.setItem(JWT_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
    }
    throw new Error('Login failed');
}

export function logout() {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.hash = '';
    window.location.reload();
}

export function getToken() {
    return localStorage.getItem(JWT_KEY);
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export async function isAuthenticated() {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {

        const response = await get('auth/verify.php');
        return response.success;
    } catch (error) {
        console.error("Token verification failed:", error.message);

        logout();
        return false;
    }
}
