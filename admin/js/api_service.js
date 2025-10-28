const BASE_URL = '/projeto_ane_cortinas_v3/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}/${endpoint}`;
  const headers = options.headers ? { ...options.headers } : {};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const config = {
    method: options.method || 'GET',
    headers,
    body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
  };

  const resp = await fetch(url, config).catch(err => {
    console.error('Fetch failed:', err);
    throw err;
  });

  if (resp.status === 204) return null;
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const err = new Error(data?.message || `Request failed: ${resp.status}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const get = (endpoint) => request(endpoint, { method: 'GET' });
export const post = (endpoint, body) => request(endpoint, { method: 'POST', body });
export const put = (endpoint, body) => request(endpoint, { method: 'PUT', body });
export const del = (endpoint) => request(endpoint, { method: 'DELETE' });