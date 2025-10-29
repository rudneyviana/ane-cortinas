
import * as api from '../api_service.js';
import { showModal, closeModal, renderSpinner, showToast } from '../ui_service.js';

/** -------------- Helpers -------------- */
const TRY_ENDPOINTS = ['customers', 'clientes', 'users', 'usuarios'];
let BASE = null;

function icon(name, cls='w-4 h-4') { return `<i data-lucide="${name}" class="${cls}"></i>`; }

function badgePlan(p) {
  if (!p) return '';
  const tone = (p==='Premium'||p==='Pro') ? 'bg-blue-100 text-blue-700' :
               (p==='Padrão'||p==='Basico'||p==='Básico') ? 'bg-gray-200 text-gray-700' :
               'bg-emerald-100 text-emerald-700';
  return `<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tone}">${p}</span>`;
}

function normalize(u) {
  return {
    id: u.id ?? u.customer_id ?? u.user_id ?? u.codigo,
    name: u.name ?? u.nome ?? u.razao_social ?? u.fantasia ?? 'Sem nome',
    email: u.email ?? u.mail,
    phone: u.phone ?? u.telefone ?? u.celular,
    city: u.city ?? u.cidade,
    state: u.state ?? u.uf ?? u.estado,
    plan: u.plan ?? u.plano ?? u.tier ?? u.nivel ?? 'Padrão',
    notes: u.notes ?? u.observacao ?? '',
  };
}

function card(u) {
  const addr = [u.city, u.state].filter(Boolean).join(', ');
  return `
    <div class="bg-white rounded-xl border shadow-sm p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-gray-800">${u.name}</h3>
            ${badgePlan(u.plan)}
          </div>
          <div class="mt-3 space-y-1 text-sm text-gray-700">
            ${u.email ? `<div class="flex items-center gap-2">${icon('mail', 'w-4 h-4')} <a class="hover:underline" href="mailto:${u.email}">${u.email}</a></div>` : ''}
            ${u.phone ? `<div class="flex items-center gap-2">${icon('phone', 'w-4 h-4')} <a class="hover:underline" href="tel:${u.phone}">${u.phone}</a></div>` : ''}
            ${addr ? `<div class="flex items-center gap-2">${icon('map-pin', 'w-4 h-4')} ${addr}</div>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-3 text-gray-500">
          <button class="hover:text-sky-700" title="Editar" data-edit="${u.id}">${icon('square-pen')}</button>
          <button class="hover:text-red-600" title="Excluir" data-del="${u.id}">${icon('trash-2')}</button>
        </div>
      </div>
    </div>
  `;
}

function listHTML() {
  return `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Clientes</h1>
        <p class="text-gray-500 mt-1">Gerencie sua base de clientes</p>
      </div>
      <button id="btn-new" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">
        ${icon('plus')} Novo Cliente
      </button>
    </div>

    <div class="bg-white rounded-xl border p-4 mb-4">
      <div class="relative">
        <input id="search" class="w-full px-4 py-2 border rounded-lg" placeholder="Buscar clientes...">
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">${icon('search')}</div>
      </div>
    </div>

    <div id="grid" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"></div>
  `;
}

function formHTML(u={}) {
  return `
    <form id="cust-form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Nome</label>
          <input name="name" required class="w-full px-3 py-2 border rounded" value="${u.name || ''}">
        </div>
        <div>
          <label class="block text-sm mb-1">Plano</label>
          <select name="plan" class="w-full px-3 py-2 border rounded">
            ${['Padrão','Básico','Premium','Pro'].map(p => `<option value="${p}" ${u.plan===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">E‑mail</label>
          <input name="email" type="email" class="w-full px-3 py-2 border rounded" value="${u.email || ''}">
        </div>
        <div>
          <label class="block text-sm mb-1">Telefone</label>
          <input name="phone" class="w-full px-3 py-2 border rounded" value="${u.phone || ''}">
        </div>
        <div>
          <label class="block text-sm mb-1">Cidade</label>
          <input name="city" class="w-full px-3 py-2 border rounded" value="${u.city || ''}">
        </div>
        <div>
          <label class="block text-sm mb-1">UF</label>
          <input name="state" maxlength="2" class="w-full px-3 py-2 border rounded" value="${u.state || ''}">
        </div>
      </div>
      <div>
        <label class="block text-sm mb-1">Observações</label>
        <textarea name="notes" class="w-full px-3 py-2 border rounded">${u.notes || ''}</textarea>
      </div>
      <input type="hidden" name="id" value="${u.id || ''}">
    </form>
  `;
}

async function resolveBase() {
  if (BASE) return BASE;
  let lastErr;
  for (const path of TRY_ENDPOINTS) {
    try {
      await api.get(path); // success means exists
      BASE = path;
      return BASE;
    } catch (e) {
      lastErr = e;
    }
  }
  // fallback: default 'customers'
  BASE = 'customers';
  return BASE;
}

async function fetchAll() {
  const base = await resolveBase();
  const list = await api.get(base);
  return (list || []).map(normalize);
}

async function createOne(payload) {
  const base = await resolveBase();
  return api.post(base, payload);
}

async function updateOne(id, payload) {
  const base = await resolveBase();
  return api.put(`${base}/${id}`, payload);
}

async function deleteOne(id) {
  const base = await resolveBase();
  return api.del(`${base}/${id}`);
}

/** -------------- View -------------- */
export async function init(container) {
  container.innerHTML = listHTML();
  const grid = container.querySelector('#grid');
  renderSpinner(grid);

  try {
    let data = await fetchAll();
    const render = (items) => {
      grid.innerHTML = items.map(card).join('');
      if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    };
    render(data);

    // Search
    const $search = container.querySelector('#search');
    $search.addEventListener('input', () => {
      const q = ($search.value || '').toLowerCase();
      const filtered = data.filter(u => {
        const values = [u.name, u.email, u.phone, u.city, u.state, u.plan].filter(Boolean).join(' ').toLowerCase();
        return values.includes(q);
      });
      render(filtered);
    });

    // New
    container.querySelector('#btn-new').addEventListener('click', () => openForm());

    // Edit/Delete events (event delegation)
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const editId = btn.getAttribute('data-edit');
      const delId = btn.getAttribute('data-del');
      if (editId) {
        const obj = data.find(x => String(x.id) === String(editId));
        openForm(obj);
      } else if (delId) {
        if (confirm('Excluir este cliente?')) {
          await deleteOne(delId);
          showToast('Cliente excluído');
          data = await fetchAll();
          render(data);
        }
      }
    });

    // Modal form
    function openForm(obj = null) {
      showModal({
        title: obj ? 'Editar Cliente' : 'Novo Cliente',
        contentHtml: formHTML(obj || {}),
        footerHtml: `
          <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
          <button id="btn-save" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
        `
      });
      document.getElementById('btn-cancel').addEventListener('click', closeModal);
      document.getElementById('btn-save').addEventListener('click', async () => {
        const fd = new FormData(document.getElementById('cust-form'));
        const payload = Object.fromEntries(fd.entries());
        // normalize minimal
        if (!payload.name) { alert('Informe o nome'); return; }
        if (payload.id) {
          const id = payload.id; delete payload.id;
          await updateOne(id, payload);
          showToast('Cliente atualizado');
        } else {
          await createOne(payload);
          showToast('Cliente criado');
        }
        closeModal();
        // Refresh
        const fresh = await fetchAll();
        grid.innerHTML = '';
        const $search = container.querySelector('#search');
        $search.value = '';
        data = fresh;
        const render = (items) => {
          grid.innerHTML = items.map(card).join('');
          if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        };
        render(data);
      });
    }

  } catch (err) {
    grid.innerHTML = `<div class="text-red-600">Falha ao carregar clientes. ${err?.message || ''}</div>`;
  }
}
