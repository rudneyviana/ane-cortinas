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
            let errorBody;
            try { errorBody = JSON.parse(responseText); }
            catch { errorBody = { error: 'An unknown API error occurred.' }; }
            const errorMessage = errorBody.error || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        if (response.status === 204) return null;
        if (!responseText.trim()) return null;

        try {
            return JSON.parse(responseText);
        } catch {
            console.error('Error parsing JSON:', responseText);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error;
    }
}

// LISTA (SITE): por padrão mostra apenas produtos ativos.
// Se quiser listar tudo, chame explicitamente com { active: '' } ou { active: null }.
export async function getProducts(filters = {}) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== null && v !== '') params.set(k, v);
    }
    if (!params.has('active')) params.set('active', '1'); // trava vitrine para ativos

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${API_BASE_URL}/products/index.php${queryString}`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        return await resp.json();
    } catch (err) {
        console.error(`API request to ${url} failed:`, err);
        throw err;
    }
}

// DETALHE (SITE): só retorna se estiver ativo (404 se inativo)
export async function getProductById(id) {
    const url = `${API_BASE_URL}/products/index.php?id=${encodeURIComponent(id)}&only_active=1`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        return await resp.json();
    } catch (err) {
        console.error(`API request to ${url} failed:`, err);
        throw err;
    }
}

// Outras rotas já existentes
export async function getCategories() {
    return apiRequest('categories/index', 'GET', null, false);
}

export async function getUserOrders() {
    return apiRequest('orders/index', 'GET', null, true);
}

export async function saveOrder(orderData) {
    return apiRequest('orders/index', 'POST', orderData, true);
}
