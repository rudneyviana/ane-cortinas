const BASE_URL = '/ane-cortinas/api';

// Constrói a URL garantindo a barra final para endpoints de 1 segmento (ex: "products/")
function buildUrl(endpoint) {
  const ep = String(endpoint || '').replace(/^\/+|\/+$/g, ''); // remove barras inicio/fim
  const isSingleSegment = !ep.includes('/');                  // "products", "categories"
  const url = `${BASE_URL}/${ep}${isSingleSegment ? '/' : ''}`;
  // colapsa barras duplicadas e preserva "http://"
  return url.replace(/([^:]\/)\/+/g, '$1');
}

async function request(endpoint, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const resp = await fetch(buildUrl(endpoint), opts);

  if (resp.status === 204) return null;

  let data = null;
  try { data = await resp.json(); } catch (_) { /* body vazio */ }

  if (!resp.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${resp.status}`;
    const err = new Error(msg);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  // Normaliza: aceita {data: ...} ou objeto direto
  return (data && (data.data ?? data)) ?? null;
}

export const get  = (endpoint)       => request(endpoint, { method: 'GET' });
export const post = (endpoint, body) => request(endpoint, { method: 'POST', body });
export const put  = (endpoint, body) => request(endpoint, { method: 'PUT', body });
export const del  = (endpoint)       => request(endpoint, { method: 'DELETE' });

export default { get, post, put, del };
