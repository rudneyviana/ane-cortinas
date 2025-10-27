import { API_BASE_URL } from './config.js';
import { getToken } from './auth.js';

async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${API_BASE_URL}/${endpoint}.php`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn(`Auth token not found for request to ${endpoint}`);
        }
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'An unknown API error occurred.' }));
            const errorMessage = errorBody.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
}

export async function login(email, password) {
    return apiRequest('auth/login', 'POST', { email, password }, false);
}

export async function register(userData) {
    return apiRequest('auth/register', 'POST', userData, false);
}

export async function getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params}` : '';
    const url = `${API_BASE_URL}/products/index.php${queryString}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
}

export async function getProductById(id) {
    const url = `${API_BASE_URL}/products/single.php?id=${id}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
}

export async function getCategories() {
    return apiRequest('categories/index', 'GET', null, false);
}

export async function getUserOrders() {
    return apiRequest('orders/index', 'GET', null, true);
}

export async function saveOrder(orderData) {
    return apiRequest('orders/index', 'POST', orderData, true);
}
