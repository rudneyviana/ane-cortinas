import * as api from '../api_service.js';
import { renderSpinner, showModal, closeModal, showToast } from '../ui_service.js';

/** ---------------- Helpers ---------------- */
const TRY_ENDPOINTS = ['fabrics', 'estoque', 'tecidos', 'stocks'];
const COLOR_ENDPOINTS = ['colors', 'cores'];
let BASE = null;
let COLORS = []; // cache

function icon(name, cls='w-4 h-4'){ return `<i data-lucide="${name}" class="${cls}"></i>`; }

function colorBadge(color_id){
  if (!color_id) return '-';
  const c = COLORS.find(x => String(x.id) === String(color_id));
  if (!c) return '-';
  const hex = c.hex_code || c.hex || c.code || '#999999';
  const name = c.name || c.nome || '—';
  return `
    <span class="inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border">
      <span class="inline-block w-3 h-3 rounded" style="background:${hex}"></span>
      ${name}
    </span>`;
}

function fmtNum(n, decimals=2){
  const v = Number(n ?? 0);
  if (Number.isNaN(v)) return '0';
  return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function row(f){
  const img = f.image_url || f.image || '';
  return `
    <tr class="border-b last:border-b-0">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          ${img ? `<img src="${img}" class="w-12 h-12 rounded object-cover" alt="">`
                : `<div class="w-12 h-12 rounded bg-gray-200"></div>`}
          <div>
            <div class="font-medium text-gray-900">${f.name || f.nome}</div>
            <div class="text-xs text-gray-500">#${f.id}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-3">${colorBadge(f.color_id)}</td>
      <td class="px-4 py-3">${fmtNum(f.width)} × ${fmtNum(f.height)} m</td>
      <td class="px-4 py-3">${fmtNum(f.stock_quantity_sqm)} m²</td>
      <td class="px-4 py-3 text-right">
        <button class="text-sky-700 mr-3" title="Editar" data-edit="${f.id}">${icon('square-pen')}</button>
        <button class="text-rose-600" title="Excluir" data-del="${f.id}">${icon('trash-2')}</button>
      </td>
    </tr>
  `;
}

function formHTML(f=null){
  const isEdit = !!f;
  const id = f?.id ?? '';
  const name = f?.name ?? '';
  const width = f?.width ?? '';
  const height = f?.height ?? '';
  const stock = f?.stock_quantity_sqm ?? '';
  const colorId = f?.color_id ?? '';

  const colorOptions = ['<option value="">Sem cor</option>'].concat(
    (COLORS||[]).map(c => {
      const idc = c.id;
      const label = `${c.name} ${c.hex_code ? '('+c.hex_code+')' : ''}`;
      const sel = String(idc) === String(colorId) ? 'selected' : '';
      return `<option value="${idc}" ${sel}>${label}</option>`;
    })
  ).join('');

  return `
    <form id="fabric-form" class="space-y-4">
      ${isEdit ? `<input type="hidden" name="id" value="${id}">` : ''}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome</label>
          <input name="name" value="${name}" required class="mt-1 block w-full rounded border-gray-300">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Cor</label>
          <select name="color_id" class="mt-1 block w-full rounded border-gray-300">
            ${colorOptions}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Largura (m)</label>
          <input name="width" type="number" step="0.01" value="${width}" required class="mt-1 block w-full rounded border-gray-300">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Altura (m – rolo)</label>
          <input name="height" type="number" step="0.01" value="${height}" required class="mt-1 block w-full rounded border-gray-300">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Estoque (m²)</label>
          <input name="stock_quantity_sqm" type="number" step="0.01" value="${stock}" required class="mt-1 block w-full rounded border-gray-300">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Imagem</label>
          <input name="image" type="file" accept="image/*" class="mt-1 block w-full rounded border-gray-300">
          <p class="text-xs text-gray-500 mt-1">Opcional. JPG/PNG. Será armazenada em <code>uploads/fabrics/</code>.</p>
        </div>
      </div>
    </form>
  `;
}

/** ---------------- CRUD ---------------- */
async function loadBaseAndColors(){
  if (!BASE){
    for (const ep of TRY_ENDPOINTS){
      try{ await api.get(ep); BASE = ep; break; } catch(_){}
    }
    if (!BASE) BASE = 'fabrics';
  }
  if (!COLORS || !COLORS.length){
    for (const ep of COLOR_ENDPOINTS){
      try{ COLORS = await api.get(ep); break; } catch(_){}
    }
    if (!COLORS) COLORS = [];
  }
}

async function fetchList(){
  await loadBaseAndColors();
  try{
    const list = await api.get(BASE);
    return Array.isArray(list) ? list : (list?.data || []);
  }catch(e){
    console.error(e);
    showToast('Falha ao carregar estoque', 'error');
    return [];
  }
}

function bindRowActions(container, list){
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-edit],button[data-del]');
    if (!btn) return;
    const id = btn.getAttribute('data-edit') || btn.getAttribute('data-del');
    const item = list.find(x => String(x.id) === String(id));

    if (btn.hasAttribute('data-edit')){
      showModal({
        title: 'Editar tecido',
        contentHtml: formHTML(item),
        footerHtml: `
          <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
          <button id="btn-save" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
        `
      });
      document.getElementById('btn-cancel').addEventListener('click', closeModal);
      document.getElementById('btn-save').addEventListener('click', async () => {
        const form = document.getElementById('fabric-form');
        const fd = new FormData(form);
        fd.append('_method', 'PUT'); // para garantir upload com override
        try{
          await api.post(`${BASE}/${id}`, fd);
          showToast('Tecido atualizado');
          closeModal();
          const root = document.getElementById('content-root');
          init(root);
        }catch(err){
          console.error(err);
          showToast('Erro ao atualizar tecido', 'error');
        }
      });
    }

    if (btn.hasAttribute('data-del')){
      const ok = confirm('Deseja realmente excluir este tecido?');
      if (!ok) return;
      try{
        try{
          await api.del(`${BASE}/${id}`);
        }catch(_){
          const fd = new FormData();
          fd.append('_method','DELETE');
          await api.post(`${BASE}/${id}`, fd);
        }
        showToast('Tecido removido');
        const root = document.getElementById('content-root');
        init(root);
      }catch(err){
        console.error(err);
        showToast('Erro ao excluir tecido', 'error');
      }
    }
  });
}

/** ---------------- View Init ---------------- */
export async function init(container){
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Estoque de Tecidos</h1>
      <div class="flex items-center gap-3">
        <div class="relative">
          <input id="search-input" placeholder="Pesquisar" class="pl-9 pr-3 py-2 rounded border-gray-300">
          <span class="absolute left-2 top-2.5 text-gray-400">${icon('search')}</span>
        </div>
        <button id="btn-new" class="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-600 text-white">
          ${icon('plus')}
          Novo tecido
        </button>
      </div>
    </div>
    <div class="bg-white rounded-xl border shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr class="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <th class="px-4 py-3">Tecido</th>
              <th class="px-4 py-3">Cor</th>
              <th class="px-4 py-3">Dimensões</th>
              <th class="px-4 py-3">Estoque</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody id="tbody-fabrics" class="text-sm text-gray-800"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#tbody-fabrics');
  renderSpinner(tbody);

  const list = await fetchList();
  tbody.innerHTML = list.map(row).join('');
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

  // Busca
  const input = container.querySelector('#search-input');
  const doFilter = () => {
    const q = (input.value || '').toLowerCase();
    const filtered = list.filter(f => {
      const name = (f.name || '').toLowerCase();
      const color = (COLORS.find(c => String(c.id)===String(f.color_id))?.name || '').toLowerCase();
      return name.includes(q) || color.includes(q);
    });
    tbody.innerHTML = filtered.map(row).join('');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  };
  input.addEventListener('input', doFilter);

  // Novo
  container.querySelector('#btn-new').addEventListener('click', () => {
    showModal({
      title: 'Novo tecido',
      contentHtml: formHTML(null),
      footerHtml: `
        <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
        <button id="btn-save" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
      `
    });
    document.getElementById('btn-cancel').addEventListener('click', closeModal);
    document.getElementById('btn-save').addEventListener('click', async () => {
      const form = document.getElementById('fabric-form');
      const fd = new FormData(form);
      try{
        await api.post(BASE || 'fabrics', fd);
        showToast('Tecido criado');
        closeModal();
        const root = document.getElementById('content-root');
        init(root);
      }catch(err){
        console.error(err);
        showToast('Erro ao criar tecido', 'error');
      }
    });
  });

  // Ações editar/excluir
  bindRowActions(container, list);
}
