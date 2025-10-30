import { API_BASE_URL } from './config.js';

const USER_STORAGE_KEY = 'aneCortinasUser';
const TOKEN_STORAGE_KEY = 'aneCortinasToken';

export function getCurrentUser() {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

export function getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function login(email, password) {
    try {
        const url = `${API_BASE_URL}/auth/login.php`;
        console.log('Login - URL:', url);
        console.log('Login - Dados:', { email, password: '***' });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login - Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Login - Response text:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Login - Erro ao parsear JSON:', e);
            return { success: false, message: 'Erro ao processar resposta do servidor' };
        }

        if (!response.ok) {
            return { success: false, message: data.error || 'Email ou senha incorretos.' };
        }

        if (data.success && data.token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
            
            // Se for admin, redireciona para o painel admin
            if (data.user.role === 'ADMIN') {
                window.location.href = '/ane-cortinas/admin/';
                return { success: true, user: data.user };
            }
            
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.error || 'Email ou senha incorretos.' };
        }
    } catch (error) {
        console.error("Login failed:", error);
        return { success: false, message: 'Erro de conexão com o servidor' };
    }
}

export function logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = 'index.html';
}

export async function register(userData) {
    try {
        const url = `${API_BASE_URL}/auth/register.php`;
        console.log('Register - URL:', url);
        console.log('Register - Dados:', { ...userData, password: '***' });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        console.log('Register - Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Register - Response text:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Register - Erro ao parsear JSON:', e);
            return { success: false, message: 'Erro ao processar resposta do servidor' };
        }

        if (!response.ok) {
            return { success: false, message: data.error || 'Não foi possível criar a conta.' };
        }

        if (data.success || data.id) {
            // Registro bem-sucedido, fazer login automático
            const loginResult = await login(userData.email, userData.password);
            
            if (loginResult.success) {
                return { success: true, user: loginResult.user };
            } else {
                return { 
                    success: false, 
                    message: 'Conta criada! Por favor, faça login.' 
                };
            }
        }
        
        return { 
            success: false, 
            message: data.error || 'Não foi possível criar a conta.' 
        };
    } catch (error) {
        console.error("Registration failed:", error);
        return { 
            success: false, 
            message: 'Erro de conexão com o servidor' 
        };
    }
}