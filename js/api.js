import { API_BASE_URL } from './config.js';
import { getToken } from './auth.js';

async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${API_BASE_URL}/${endpoint}.php`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn(`Auth token not found for request to ${endpoint}`);
        }
    }

    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(url, options);
        const responseText = await response.text();

        if (!response.ok) {
            let body;
            try { body = JSON.parse(responseText); } catch { body = { error: 'An unknown API error occurred.' }; }
            const msg = body.error || `HTTP error! status: ${response.status}`;
            throw new Error(msg);
        }

        if (response.status === 204) return null;
        if (responseText.trim() === '') return null;

        try { return JSON.parse(responseText); }
        catch {
            console.error('Error parsing JSON:', responseText);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
}

// ===== LISTAGEM P/ LOJA =====
// Por padrão, a loja pede somente ativos e ordena com cortinas primeiro.
// (O Admin não usa este arquivo; ele usa /admin/js/api_service.js)
export async function getProducts(filters = {}) {
    const defaults = {
        active: 1,
        sort: 'cortinas_first',
    };
    const merged = { ...defaults, ...filters };
    const params = new URLSearchParams(merged);
    const queryString = params.toString() ? `?${params}` : '';
    const url = `${API_BASE_URL}/products/index.php${queryString}`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        return await resp.json();
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

// ==== demais (inalterados) ====
export async function getCategories() {
    return apiRequest('categories/index', 'GET', null, false);
}

export async function getUserOrders() {
    return apiRequest('orders/index', 'GET', null, true);
}

export async function saveOrder(orderData) {
    return apiRequest('orders/index', 'POST', orderData, true);
}
