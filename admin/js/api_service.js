const BASE_URL = '/ane-cortinas/api';

async function request(endpoint, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const url = `${BASE_URL}/${endpoint}`.replace(/\/+$/, '').replace(/([^:]\/)\/+/, '$1/');
  const resp = await fetch(url, opts);

  if (resp.status === 204) return null;
  let data = null;
  try { data = await resp.json(); } catch (_) { data = null; }

  if (!resp.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${resp.status}`;
    const err = new Error(msg);
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

export default { get, post, put, del };