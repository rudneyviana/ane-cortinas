import { login as apiLogin, register as apiRegister } from './api.js';

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
        const response = await apiLogin(email, password);
        if (response.success && response.token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
            
            // Se for admin, redireciona para o painel admin
            if (response.user.role === 'ADMIN') {
                window.location.href = '/projeto_ane_cortinas/admin/';
                return { success: true, user: response.user };
            }
            
            return { success: true, user: response.user };
        } else {
            return { success: false, message: response.error || 'Email ou senha incorretos.' };
        }
    } catch (error) {
        console.error("Login failed:", error);
        return { success: false, message: error.message || 'Email ou senha incorretos.' };
    }
}

export function logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = 'index.html';
}

    export async function register(userData) {
    try {
        console.log('Iniciando registro com dados:', userData);
        const response = await apiRegister(userData);
        console.log('Resposta do registro:', response);
        
        if (response.id) {
            // Se o registro foi bem sucedido, tenta fazer login diretamente
            const loginResult = await apiLogin(userData.email, userData.password);
            console.log('Resposta do login após registro:', loginResult);
            
            if (loginResult.token) {
                // Login bem sucedido
                localStorage.setItem(TOKEN_STORAGE_KEY, loginResult.token);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loginResult.user));
                return { success: true, user: loginResult.user };
            }
        }
        
        return { 
            success: false, 
            message: response.error || 'Registro bem sucedido, mas não foi possível fazer login automático. Por favor, tente fazer login manualmente.' 
        };
    } catch (error) {
        console.error("Registration failed:", error);
        return { 
            success: false, 
            message: error.message || 'Não foi possível criar a conta.' 
        };
    }
}