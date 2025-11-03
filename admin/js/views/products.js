import * as api from '../api_service.js';
import { showModal, closeModal, renderSpinner, showToast } from '../ui_service.js';

function moneyBRL(v) {
  if (v === null || v === undefined || isNaN(v)) return 'R$ 0,00';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function statusPill(active) {
  const txt = active ? 'Ativo' : 'Inativo';
  const cls = active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700';
  return `<span class="px-2 py-1 rounded text-xs font-medium ${cls}">${txt}</span>`;
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[s]
  ));
}

function productRow(p) {
  const thumb = p.image_url
    ? `<img src="${escapeHtml(p.image_url)}" class="w-14 h-14 object-cover rounded border">`
    : `<div class="w-14 h-14 bg-stone-100 rounded border flex items-center justify-center text-stone-400">N/D</div>`;
  return `
    <tr class="border-b last:border-0">
      <td class="p-4">
        <div class="flex items-center gap-3">
          ${thumb}
          <div>
            <div class="font-medium text-stone-800">${escapeHtml(p.name)}</div>
            <div class="text-xs text-stone-500">Categoria: ${escapeHtml(p.category_name || '')}</div>
          </div>
        </div>
      </td>
      <td class="p-4 whitespace-nowrap">${moneyBRL(p.base_price ?? p.price)}</td>
      <td class="p-4">${statusPill(!!p.is_active || !!p.active)}</td>
      <td class="p-4 text-right">
        <button class="text-amber-700 hover:text-amber-900 mr-3 btn-edit" data-id="${p.id}" title="Editar">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="text-red-600 hover:text-red-800 btn-del" data-id="${p.id}" title="Excluir">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    </tr>
  `;
}

function renderTable(holder, list) {
  holder.innerHTML = `
    <div class="border rounded overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stone-50 text-stone-600">
          <tr>
            <th class="text-left p-3 font-medium">Produto</th>
            <th class="text-left p-3 font-medium">Preço Base</th>
            <th class="text-left p-3 font-medium">Status</th>
            <th class="text-right p-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody id="rows">${list.map(productRow).join('')}</tbody>
      </table>
    </div>
  `;
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}

// --- Form ---
function formHTML(p) {
  p = p || {};
  const id = p.id ?? '';
  const name = p.name ?? '';
  const sku = p.sku ?? '';
  const category_id = p.category_id ?? '';
  const base_price = p.base_price ?? p.price ?? '';
  const image_url = p.image_url ?? '';
  const active = (p.is_active ?? p.active ?? true) ? 'checked' : '';

  return `
    <form id="product-form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Nome</label>
          <input name="name" required class="w-full px-3 py-2 border rounded" value="${escapeHtml(name)}">
        </div>
        <div>
          <label class="block text-sm mb-1">SKU (opcional)</label>
          <input name="sku" class="w-full px-3 py-2 border rounded" value="${escapeHtml(sku)}">
        </div>
        <div>
          <label class="block text-sm mb-1">Categoria</label>
          <select name="category_id" required class="w-full px-3 py-2 border rounded">
            <option value="">Carregando...</option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Preço Base</label>
          <input name="base_price" required class="w-full px-3 py-2 border rounded" placeholder="Ex.: 65,00" value="${escapeHtml(base_price)}">
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Imagem (URL)</label>
          <input name="image_url" class="w-full px-3 py-2 border rounded" value="${escapeHtml(image_url)}">
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
    contentHtml: formHTML(product || {}),
    footerHtml: `
      <button id="btn-cancel" type="button" class="px-4 py-2 rounded border mr-2">Cancelar</button>
      <button id="btn-save" type="button" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
    `
  });

  const $form = document.getElementById('product-form');
  const $cat = $form.querySelector('select[name=category_id]');

  try {
    const categories = await api.get('categories');
    $cat.innerHTML = categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    if (product?.category_id) $cat.value = String(product.category_id);
  } catch {
    $cat.innerHTML = `<option value="">Falha ao carregar</option>`;
  }

  document.getElementById('btn-cancel').addEventListener('click', closeModal);

  document.getElementById('btn-save').addEventListener('click', async () => {
    const fd = new FormData($form);
    const payload = {
      name: fd.get('name')?.toString().trim(),
      category_id: Number(fd.get('category_id') || 0),
      base_price: fd.get('base_price')?.toString().trim(),
      image_url: fd.get('image_url')?.toString().trim() || null,
      active: document.getElementById('active').checked ? 1 : 0,
    };

    if (!payload.name) return showToast('Informe o nome do produto.', 'error');
    if (!payload.category_id) return showToast('Selecione uma categoria.', 'error');
    if (!payload.base_price) return showToast('Informe o preço base.', 'error');

    try {
      // Aceita tanto payload cru quanto {data: {...}}
      const result = product && product.id
        ? await api.put(`products/${product.id}`, payload)
        : await api.post('products', payload);

      const row = result?.data ?? result ?? {};
      if (row?.error) throw new Error(row.error);

      showToast(product && product.id ? 'Produto atualizado' : 'Produto criado');
      closeModal();

      const holder = document.getElementById('list-holder');
      renderSpinner(holder);
      const list = await api.get('products');
      renderTable(holder, list);
    } catch (err) {
      showToast(err?.message || 'Falha ao salvar.', 'error');
    }
  });
}

function openDeleteModal(id) {
  showModal({
    title: 'Excluir Produto',
    contentHtml: `<p class="text-stone-700">Tem certeza que deseja excluir este produto?</p>`,
    footerHtml: `
      <button id="btn-cancel" type="button" class="px-4 py-2 rounded border mr-2">Cancelar</button>
      <button id="btn-confirm-del" type="button" class="px-4 py-2 rounded bg-red-600 text-white">Excluir</button>
    `,
  });

  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-confirm-del').addEventListener('click', async () => {
    try {
      await api.del(`products/${id}`);
      closeModal();
      showToast('Produto excluído');

      const holder = document.getElementById('list-holder');
      renderSpinner(holder);
      const list = await api.get('products');
      renderTable(holder, list);
    } catch (err) {
      showToast(err?.message || 'Não foi possível excluir.', 'error');
    }
  });
}

// ---------------- INIT ----------------
export async function init(container) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
      <button id="btn-new" type="button" class="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded">
        <i data-lucide="plus"></i> Novo Produto
      </button>
    </div>
    <div class="bg-white rounded shadow">
      <div class="p-6" id="list-holder"></div>
    </div>
  `;

  const newBtn = container.querySelector('#btn-new');
  if (newBtn) {
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openFormModal(null);
    });
  }

  if (!container.__productsBound) {
    container.addEventListener('click', async (ev) => {
      const editBtn = ev.target.closest && ev.target.closest('.btn-edit');
      const delBtn  = ev.target.closest && ev.target.closest('.btn-del');

      if (editBtn) {
        ev.preventDefault();
        const id = Number(editBtn.dataset.id);
        if (!id) return;
        try {
          const p = await api.get(`products/${id}`);
          return openFormModal(p);
        } catch {
          showToast('Falha ao carregar produto.', 'error');
        }
      }

      if (delBtn) {
        ev.preventDefault();
        const id = Number(delBtn.dataset.id);
        if (!id) return;
        return openDeleteModal(id);
      }
    });
    container.__productsBound = true;
  }

  const holder = container.querySelector('#list-holder');
  renderSpinner(holder);
  try {
    const list = await api.get('products');
    renderTable(holder, list);
  } catch (err) {
    holder.innerHTML = `<div class="text-red-600">Falha ao carregar produtos. ${escapeHtml(err?.message || '')}</div>`;
  }
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}
