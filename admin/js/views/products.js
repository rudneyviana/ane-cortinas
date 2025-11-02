
import * as api from '../api_service.js';
import { showModal, closeModal, renderSpinner, showToast } from '../ui_service.js';

function moneyBRL(v) {
  if (v === null || v === undefined || isNaN(v)) return 'R$ 0,00';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusPill(active) {
  const txt = active ? 'Ativo' : 'Inativo';
  const cls = active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700';
  return `<span class="px-2 py-1 rounded text-xs font-medium ${cls}">${txt}</span>`;
}

function productRow(p) {
  const thumb = p.image_url || p.image || p.thumbnail || '';
  const category = p.category_name || p.category || '-';
  const estoque = (p.stock_text ?? p.stock ?? '').toString() || '-';
  return `
    <tr class="border-b last:border-b-0">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          ${thumb ? `<img src="${thumb}" class="w-12 h-12 rounded object-cover" alt="">` : `<div class="w-12 h-12 rounded bg-gray-200"></div>`}
          <div>
            <div class="font-medium text-gray-800">${p.name || p.title}</div>
            ${p.subtitle ? `<div class="text-gray-500 text-xs">${p.subtitle}</div>` : ''}
          </div>
        </div>
      </td>
      <td class="px-4 py-3 text-gray-700">${p.sku || '-'}</td>
      <td class="px-4 py-3 text-gray-700">${category}</td>
      <td class="px-4 py-3 text-gray-700">${moneyBRL(Number(p.base_price ?? p.price ?? 0))}</td>
      <td class="px-4 py-3 text-gray-700">${estoque || '-'}</td>
      <td class="px-4 py-3">${statusPill(!!(p.active ?? p.status ?? true))}</td>
      <td class="px-4 py-3 text-right">
        <button class="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 mr-3" data-edit="${p.id}">
          <i data-lucide="square-pen" class="w-4 h-4"></i>
        </button>
        <button class="inline-flex items-center gap-1 text-red-600 hover:text-red-800" data-del="${p.id}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
  `;
}

function renderTable(container, list) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
      <button id="btn-new" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">
        <i data-lucide="plus"></i> Novo Produto
      </button>
    </div>

    <div class="bg-white rounded shadow">
      <div class="p-4 border-b">
        <input id="search-input" class="w-full px-3 py-2 border rounded" placeholder="Buscar por nome, SKU ou categoria..." />
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600">
            <tr>
              <th class="px-4 py-3">PRODUTO</th>
              <th class="px-4 py-3">SKU</th>
              <th class="px-4 py-3">CATEGORIA</th>
              <th class="px-4 py-3">PREÇO BASE</th>
              <th class="px-4 py-3">ESTOQUE</th>
              <th class="px-4 py-3">STATUS</th>
              <th class="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody id="tbody-products" class="text-sm"></tbody>
        </table>
      </div>
    </div>
  `;

  const tbody = container.querySelector('#tbody-products');
  tbody.innerHTML = list.map(productRow).join('');

  const doFilter = () => {
    const q = (container.querySelector('#search-input').value || '').toLowerCase();
    const filtered = list.filter(p => {
      const name = (p.name || p.title || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const cat = (p.category_name || p.category || '').toLowerCase();
      return name.includes(q) || sku.includes(q) || cat.includes(q);
    });
    tbody.innerHTML = filtered.map(productRow).join('');
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  };
  container.querySelector('#search-input').addEventListener('input', doFilter);

  // Events: new, edit, delete
  container.querySelector('#btn-new').addEventListener('click', () => openFormModal());

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const delId = btn.getAttribute('data-del');
    const editId = btn.getAttribute('data-edit');
    if (delId) {
      if (confirm('Excluir este produto?')) {
        try {
          await api.del(`products/${delId}`);
          showToast('Produto excluído');
          init(container); // recarrega a tabela
        } catch (err) {
          showToast(err?.message || 'Falha ao excluir produto');
        }
      }
    }
  });

  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}

function formHTML(p = {}) {
  const id = p.id || '';
  const name = p.name || p.title || '';
  const sku = p.sku || '';
  const category_id = p.category_id || '';
  const base_price = p.base_price ?? p.price ?? '';
  const stock_text = p.stock_text ?? p.stock ?? '';
  const image_url = p.image_url || p.image || '';
  const active = (p.active ?? p.status ?? true) ? 'checked' : '';

  return `
    <form id="product-form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Nome</label>
          <input name="name" required class="w-full px-3 py-2 border rounded" value="${name}">
        </div>
        <div>
          <label class="block text-sm mb-1">SKU</label>
          <input name="sku" class="w-full px-3 py-2 border rounded" value="${sku}">
        </div>
        <div>
          <label class="block text-sm mb-1">Categoria</label>
          <select name="category_id" class="w-full px-3 py-2 border rounded"></select>
        </div>
        <div>
          <label class="block text-sm mb-1">Preço Base</label>
          <input name="base_price" type="number" step="0.01" class="w-full px-3 py-2 border rounded" value="${base_price}">
        </div>
        <div>
          <label class="block text-sm mb-1">Estoque</label>
          <input name="stock_text" class="w-full px-3 py-2 border rounded" value="${stock_text}">
        </div>
        <div>
          <label class="block text-sm mb-1">Imagem (URL)</label>
          <input name="image_url" class="w-full px-3 py-2 border rounded" value="${image_url}">
        </div>
        <div class="flex items-center gap-2">
          <input id="active" type="checkbox" ${active}>
          <label for="active">Ativo</label>
        </div>
      </div>
      <input type="hidden" name="id" value="${id}">
    </form>
  `;
}

async function openFormModal(product = null) {
  showModal({
    title: product ? 'Editar Produto' : 'Novo Produto',
    contentHtml: formHTML(product),
    footerHtml: `
      <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
      <button id="btn-save" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
    `
  });

  // Load categories into select
  const $form = document.getElementById('product-form');
  const $cat = $form.querySelector('select[name=category_id]');
  try {
    const categories = await api.get('categories');
    $cat.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  } catch {
    $cat.innerHTML = '<option value="">Sem categorias</option>';
  }
  if (product?.category_id) $cat.value = product.category_id;

  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-save').addEventListener('click', async () => {
    const fd = new FormData($form);
    const payload = Object.fromEntries(fd.entries());
    payload.active = document.getElementById('active').checked;
    payload.base_price = parseFloat(payload.base_price || 0);
    if (!payload.name) { alert('Informe o nome'); return; }

    if (payload.id) {
      const id = payload.id;
      delete payload.id;
      await api.put(`products/${id}`, payload);
      showToast('Produto atualizado');
    } else {
      await api.post('products', payload);
      showToast('Produto criado');
    }
    closeModal();
    // reload list
    const root = document.getElementById('content-root');
    init(root);
  });
}

export async function init(container) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
      <button class="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded" id="btn-new">
        <i data-lucide="plus"></i> Novo Produto
      </button>
    </div>
    <div class="bg-white rounded shadow">
      <div class="p-6" id="list-holder"></div>
    </div>
  `;

  const holder = container.querySelector('#list-holder');
  renderSpinner(holder);
  try {
    // Tolerante: tanto 'products' quanto 'produtos' (se backend em pt)
    let list;
    try {
      list = await api.get('products');
    } catch {
      list = await api.get('produtos');
    }
    // Normaliza campos para exibição
    list = (list || []).map(p => ({
      id: p.id ?? p.product_id ?? p.codigo,
      name: p.name ?? p.nome,
      sku: p.sku ?? p.codigo_sku,
      category_id: p.category_id ?? p.categoria_id,
      category_name: p.category_name ?? p.categoria,
      base_price: p.base_price ?? p.preco_base,
      stock_text: p.stock_text ?? p.estoque,
      active: p.active ?? (p.status === 'Ativo' ? true : p.status === 'Inativo' ? false : p.status),
      image_url: p.image_url ?? p.imagem,
    }));
    holder.innerHTML = '';
    renderTable(container, list);
  } catch (err) {
    holder.innerHTML = `<div class="text-red-600">Falha ao carregar produtos. ${err?.message || ''}</div>`;
  }

  container.querySelector('#btn-new').addEventListener('click', () => openFormModal());
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}
