// admin/js/views/products.js
import * as api from '../api_service.js';
import { showModal, closeModal, renderSpinner, showToast } from '../ui_service.js';

function moneyBRL(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusPill(active) {
  const on = !!active;
  return `<span class="px-2 py-1 rounded text-xs font-medium ${on ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}">${on ? 'Ativo' : 'Inativo'}</span>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function productRow(p) {
  const thumb = p.image_url
    ? `<img src="${escapeHtml(p.image_url)}" class="w-12 h-12 rounded object-cover border" alt="">`
    : `<div class="w-12 h-12 rounded bg-stone-200 border"></div>`;
  const name   = p.name ?? p.title ?? '';
  const sku    = p.sku ?? '-';
  const cat    = p.category_name ?? p.category ?? '-';
  const price  = moneyBRL(p.base_price ?? p.price ?? 0);
  const stock  = (p.stock_text ?? p.stock ?? '-') || '-';
  const id     = p.id;

  return `
    <tr class="border-b last:border-0">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          ${thumb}
          <div><div class="font-medium text-stone-800">${escapeHtml(name)}</div></div>
        </div>
      </td>
      <td class="px-4 py-3 text-stone-700">${escapeHtml(sku)}</td>
      <td class="px-4 py-3 text-stone-700">${escapeHtml(cat)}</td>
      <td class="px-4 py-3 text-stone-700 whitespace-nowrap">${price}</td>
      <td class="px-4 py-3 text-stone-700">${escapeHtml(String(stock))}</td>
      <td class="px-4 py-3">${statusPill(p.is_active ?? p.active)}</td>
      <td class="px-4 py-3 text-right">
        <button class="text-amber-700 hover:text-amber-900 mr-3 btn-edit" data-id="${id}" title="Editar"><i data-lucide="square-pen"></i></button>
        <button class="text-red-600 hover:text-red-800 btn-del" data-id="${id}" title="Excluir"><i data-lucide="trash-2"></i></button>
      </td>
    </tr>
  `;
}

function renderShell(container) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gerenciar Produtos</h1>
      <button id="btn-new" type="button" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">
        <i data-lucide="plus"></i> Novo Produto
      </button>
    </div>

    <div class="bg-white rounded shadow">
      <div class="p-4 border-b">
        <input id="search-input" class="w-full px-3 py-2 border rounded" placeholder="Buscar por nome, SKU ou categoria...">
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-stone-50 text-left text-xs font-semibold text-stone-600">
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
          <tbody id="rows"></tbody>
        </table>
      </div>
    </div>
  `;
}

function bindList(container, list) {
  const rows = container.querySelector('#rows');
  const render = (items) => {
    rows.innerHTML = items.map(productRow).join('');
    if (window.lucide?.createIcons) window.lucide.createIcons();
  };
  render(list);

  const searchEl = container.querySelector('#search-input');
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.toLowerCase();
    const filtered = list.filter(p => {
      const name = (p.name ?? '').toLowerCase();
      const sku  = (p.sku ?? '').toLowerCase();
      const cat  = (p.category_name ?? '').toLowerCase();
      return name.includes(q) || sku.includes(q) || cat.includes(q);
    });
    render(filtered);
  });
}

/* ========= MODAL ========= */
function formHTML(p = {}) {
  const id          = p.id ?? '';
  const name        = p.name ?? '';
  const sku         = p.sku ?? '';
  const category_id = p.category_id ?? '';
  const base_price  = p.base_price ?? p.price ?? '';
  const stock_text  = p.stock_text ?? p.stock ?? '';
  const image_url   = p.image_url ?? '';
  const description = p.description ?? '';
  const active      = (p.is_active ?? p.active ?? true) ? 'checked' : '';

  // Layout solicitado:
  // "Nome"  "SKU"
  // "Categoria" "Preço Base"
  // "Estoque"   "Imagem (URL)"
  // "Descrição"
  // "Ativo"
  return `
    <form id="product-form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Linha 1 -->
        <div>
          <label class="block text-sm mb-1">Nome</label>
          <input name="name" required class="w-full px-3 py-2 border rounded" value="${escapeHtml(name)}">
        </div>
        <div>
          <label class="block text-sm mb-1">SKU</label>
          <input name="sku" class="w-full px-3 py-2 border rounded" value="${escapeHtml(sku)}">
        </div>

        <!-- Linha 2 -->
        <div>
          <label class="block text-sm mb-1">Categoria</label>
          <select name="category_id" required class="w-full px-3 py-2 border rounded">
            <option value="">Carregando...</option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Preço Base</label>
          <input name="base_price" required type="number" step="0.01" class="w-full px-3 py-2 border rounded" placeholder="Ex.: 65,00" value="${escapeHtml(base_price)}">
        </div>

        <!-- Linha 3 -->
        <div>
          <label class="block text-sm mb-1">Estoque</label>
          <input name="stock_text" class="w-full px-3 py-2 border rounded" value="${escapeHtml(stock_text)}">
        </div>
        <div>
          <label class="block text-sm mb-1">Imagem (URL)</label>
          <input name="image_url" class="w-full px-3 py-2 border rounded" value="${escapeHtml(image_url)}">
        </div>

        <!-- Linha 4 (full) -->
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Descrição</label>
          <textarea name="description" rows="4" class="w-full px-3 py-2 border rounded" placeholder="Detalhe o produto...">${escapeHtml(description)}</textarea>
        </div>

        <!-- Linha 5 -->
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
      <button id="btn-save"   type="button" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
    `
  });

  const $form = document.getElementById('product-form');
  const $cat  = $form.querySelector('select[name=category_id]');

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
      name:        fd.get('name')?.toString().trim(),
      sku:         fd.get('sku')?.toString().trim() || null,
      category_id: Number(fd.get('category_id') || 0),
      base_price:  fd.get('base_price')?.toString().trim(),
      stock_text:  fd.get('stock_text')?.toString().trim() || null,
      image_url:   fd.get('image_url')?.toString().trim() || null,
      description: fd.get('description')?.toString().trim() || null,
      active:      document.getElementById('active').checked ? 1 : 0,
    };

    if (!payload.name)        return showToast('Informe o nome do produto.', 'error');
    if (!payload.category_id) return showToast('Selecione uma categoria.', 'error');
    if (!payload.base_price)  return showToast('Informe o preço base.', 'error');

    try {
      if (product?.id) {
        await api.put(`products/${product.id}`, payload);
        showToast('Produto atualizado');
      } else {
        await api.post('products', payload);
        showToast('Produto criado');
      }
      closeModal();

      // recarrega lista
      const holder = document.getElementById('list-holder');
      renderSpinner(holder);
      const list = await api.get('products');
      renderTable(holder.parentElement, list);
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
      renderTable(holder.parentElement, list);
    } catch (err) {
      showToast(err?.message || 'Não foi possível excluir.', 'error');
    }
  });
}

function renderTable(container, list) {
  renderShell(container);
  bindList(container, list);

  const newBtn = container.querySelector('#btn-new');
  newBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openFormModal(null);
  });

  container.addEventListener('click', async (ev) => {
    const editBtn = ev.target.closest?.('.btn-edit');
    const delBtn  = ev.target.closest?.('.btn-del');

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

  if (window.lucide?.createIcons) window.lucide.createIcons();
}

// ---------- INIT ----------
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

  const holder = container.querySelector('#list-holder');
  renderSpinner(holder);

  try {
    const list = await api.get('products');
    renderTable(container, list);
  } catch (err) {
    holder.innerHTML = `<div class="text-red-600">Falha ao carregar produtos. ${escapeHtml(err?.message || '')}</div>`;
  }
  if (window.lucide?.createIcons) window.lucide.createIcons();
}
