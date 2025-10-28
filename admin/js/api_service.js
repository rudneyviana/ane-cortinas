const BASE_URL = '../api';

const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}/${endpoint}`;
    const token = localStorage.getItem('jwt_token');

    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };
    
    if (config.body && typeof config.body !== 'string' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        
        if (response.status === 204) { // No Content
            return null;
        }

        const responseData = await response.json();

        if (!response.ok) {
            let errorMessage = `API Error: ${response.statusText}`;
            if (responseData && responseData.error) {
                errorMessage = responseData.error;
            } else if (responseData && responseData.message) {
                errorMessage = responseData.message;
            }
            throw new Error(errorMessage);
        }

        return responseData;
    } catch (error) {
        console.error(`API request failed: ${error.message}`);
        throw error;
    }
};

export const get = (endpoint) => request(endpoint, { method: 'GET' });

export const post = (endpoint, body) => request(endpoint, { method: 'POST', body });

export const put = (endpoint, body) => request(endpoint, { method: 'PUT', body });

export const del = (endpoint) => request(endpoint, { method: 'DELETE' });

export const postWithFile = (endpoint, formData) => request(endpoint, {
    method: 'POST',
    body: formData,
});
