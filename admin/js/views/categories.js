// admin/js/views/categories.js
import * as api from '../api_service.js';
import { renderSpinner, showModal, closeModal, showToast } from '../ui_service.js';

/** ---------------- Config & Helpers ---------------- */
const TRY_ENDPOINTS = ['categories', 'categorias']; // fallback pt/en
let BASE = null; // endpoint autodetectado

function icon(name, cls = 'w-4 h-4') {
  return `<i data-lucide="${name}" class="${cls}"></i>`;
}

function normalizeCategory(c) {
  return {
    id: c.id,
    name: c.name ?? c.nome ?? '',
    description: c.description ?? c.descricao ?? '',
    total_products: c.total_products ?? c.total ?? c.produtos ?? 0,
  };
}

function thSort(label, key, currentSort) {
  const isActive = currentSort.key === key;
  const dirIcon = currentSort.dir === 'asc' ? 'arrow-up' : 'arrow-down';
  return `
    <th data-sort="${key}" class="px-4 py-3 text-left text-sm font-semibold text-gray-700 select-none cursor-pointer">
      <div class="inline-flex items-center gap-1">
        <span>${label}</span>
        ${isActive ? icon(dirIcon) : ''}
      </div>
    </th>`;
}

function row(c) {
  const canDelete = (c.total_products || 0) === 0;
  return `
  <tr class="border-b last:border-b-0">
    <td class="px-4 py-3 font-medium text-gray-800">${c.name || '-'}</td>
    <td class="px-4 py-3 text-gray-700">${c.description ? c.description : '-'}</td>
    <td class="px-4 py-3 text-gray-700">${c.total_products ?? 0}</td>
    <td class="px-4 py-3 text-right">
      <button class="text-sky-700 mr-3" data-edit="${c.id}" title="Editar">${icon('square-pen')}</button>
      <button class="${canDelete ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'}"
              ${canDelete ? `data-del="${c.id}"` : 'disabled'}
              title="${canDelete ? 'Excluir' : 'Não é possível excluir: possui produtos'}">
        ${icon('trash-2')}
      </button>
    </td>
  </tr>`;
}

function formHTML(cat = null) {
  const title = cat ? 'Editar Categoria' : 'Nova Categoria';
  const name = cat?.name ?? '';
  return `
    <form id="cat-form" class="space-y-4">
      <input type="hidden" name="id" value="${cat?.id ?? ''}">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nome</label>
        <input name="name" value="${name}" required maxlength="60"
               class="mt-1 block w-full rounded border-gray-300" placeholder="Ex.: Cortinas">
      </div>
      <!-- Mantemos o campo somente no front (back atual só usa 'name'); deixo aqui desabilitado para evitar erro -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Descrição (opcional)</label>
        <input name="description" value="${cat?.description ?? ''}" maxlength="120"
               class="mt-1 block w-full rounded border-gray-300" placeholder="Texto curto" disabled>
        <p class="text-xs text-gray-500 mt-1">Obs.: o backend atual só grava o nome; descrição é futura.</p>
      </div>
    </form>
  `;
}

/** ---------------- Autodetect do endpoint ---------------- */
async function detectBaseEndpoint() {
  if (BASE) return BASE;
  for (const e of TRY_ENDPOINTS) {
    try {
      await api.get(e);
      BASE = e;
      return BASE;
    } catch (_) { /* tenta o próximo */ }
  }
  // fallback padrão
  BASE = 'categories';
  return BASE;
}

/** ---------------- Render table (busca/ordenação/paginação) ---------------- */
function renderTable(container, data) {
  const state = {
    list: [...data],
    search: '',
    sort: { key: 'name', dir: 'asc' }, // asc|desc
    page: 1,
    perPage: 10,
  };

  const tbody = container.querySelector('#tbody');
  const counter = container.querySelector('#counter');
  const pager = container.querySelector('#pager');

  function applyFilterSort() {
    const q = state.search.trim().toLowerCase();
    let arr = [...state.list];

    if (q) {
      arr = arr.filter(c =>
        (c.name ?? '').toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      const k = state.sort.key;
      const va = (a[k] ?? '').toString().toLowerCase();
      const vb = (b[k] ?? '').toString().toLowerCase();
      if (va < vb) return state.sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return state.sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }

  function renderRows() {
    const arr = applyFilterSort();
    const total = arr.length;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    state.page = Math.min(state.page, pages);

    const start = (state.page - 1) * state.perPage;
    const pageItems = arr.slice(start, start + state.perPage);

    tbody.innerHTML = pageItems.map(row).join('') || `
      <tr>
        <td colspan="4" class="px-4 py-8 text-center text-gray-500">
          Nenhuma categoria encontrada.
        </td>
      </tr>`;

    counter.textContent = `${total} ${total === 1 ? 'categoria' : 'categorias'}`;
    pager.innerHTML = `
      <div class="inline-flex items-center gap-2">
        <button class="px-2 py-1 rounded border ${state.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" data-page="prev">Anterior</button>
        <span class="text-sm">Página ${state.page} de ${pages}</span>
        <button class="px-2 py-1 rounded border ${state.page >= pages ? 'opacity-50 cursor-not-allowed' : ''}" data-page="next">Próxima</button>
      </div>
    `;

    // Ícones
    if (window.lucide?.createIcons) window.lucide.createIcons();

    // Ações linha
    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit');
        const cat = state.list.find(x => String(x.id) === String(id));
        openFormModal(container, state, cat);
      });
    });
    tbody.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del');
        confirmDelete(container, state, id);
      });
    });
  }

  // Busca
  container.querySelector('#search-input').addEventListener('input', (e) => {
    state.search = e.target.value;
    state.page = 1;
    renderRows();
  });

  // Ordenação
  container.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sort.key = key;
        state.sort.dir = 'asc';
      }
      // re-render cabeçalho para refletir ícone
      container.querySelector('#thead').innerHTML = `
        ${thSort('Nome', 'name', state.sort)}
        ${thSort('Descrição', 'description', state.sort)}
        ${thSort('# Produtos', 'total_products', state.sort)}
        <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
      `;
      // rebind
      container.querySelectorAll('th[data-sort]').forEach(th2 => th2.addEventListener('click', th.click));
      renderRows();
    });
  });

  // Paginação
  pager.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn) return;
    const type = btn.getAttribute('data-page');
    if (type === 'prev' && state.page > 1) state.page--;
    if (type === 'next') state.page++;
    renderRows();
  });

  renderRows();
}

/** ---------------- Modals (Create/Update/Delete) ---------------- */
function openFormModal(container, state, cat = null) {
  showModal({
    title: cat ? 'Editar Categoria' : 'Nova Categoria',
    contentHtml: formHTML(cat),
    footerHtml: `
      <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
      <button id="btn-save" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
    `,
  });

  document.getElementById('btn-cancel')?.addEventListener('click', closeModal);

  document.getElementById('btn-save')?.addEventListener('click', async () => {
    const fd = new FormData(document.getElementById('cat-form'));
    let name = (fd.get('name') || '').toString().trim();
    const id = fd.get('id');

    if (name.length < 2) {
      showToast('O nome deve ter pelo menos 2 caracteres.', 'error');
      return;
    }
    // Normalização
    name = name.replace(/\s+/g, ' ');

    try {
      const base = await detectBaseEndpoint();
      if (id) {
        await api.put(`${base}/${id}`, { name });
        showToast('Categoria atualizada com sucesso!', 'success');
      } else {
        await api.post(base, { name });
        showToast('Categoria criada com sucesso!', 'success');
      }
      closeModal();
      await reloadAndRender(container, state);
    } catch (err) {
      showToast(err?.message || 'Falha ao salvar categoria.', 'error');
    }
  });
}

function confirmDelete(container, state, id) {
  const cat = state.list.find(x => String(x.id) === String(id));
  showModal({
    title: 'Excluir categoria',
    contentHtml: `
      <div class="space-y-3">
        <p>Tem certeza que deseja excluir <strong>${cat?.name ?? 'esta categoria'}</strong>?</p>
        <p class="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
      </div>
    `,
    footerHtml: `
      <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
      <button id="btn-confirm" class="px-4 py-2 rounded bg-red-600 text-white">Excluir</button>
    `,
  });

  document.getElementById('btn-cancel')?.addEventListener('click', closeModal);
  document.getElementById('btn-confirm')?.addEventListener('click', async () => {
    try {
      const base = await detectBaseEndpoint();
      await api.del(`${base}/${id}`);
      closeModal();
      showToast('Categoria excluída.', 'success');
      await reloadAndRender(container, state);
    } catch (err) {
      showToast(err?.message || 'Falha ao excluir.', 'error');
    }
  });
}

/** ---------------- Carregamento e Render principal ---------------- */
async function fetchCategories() {
  const base = await detectBaseEndpoint();
  try {
    const list = await api.get(base);
    return Array.isArray(list) ? list.map(normalizeCategory) : [];
  } catch (err) {
    // fallback extra se o servidor tiver outra rota legada
    try {
      const alt = await api.get('categorias');
      return Array.isArray(alt) ? alt.map(normalizeCategory) : [];
    } catch (e2) {
      throw err;
    }
  }
}

async function reloadAndRender(container, state) {
  const holder = container.querySelector('#holder');
  renderSpinner(holder);
  const list = await fetchCategories();
  state.list = list;
  // limpa e redesenha tabela
  holder.innerHTML = `
    <table class="min-w-full">
      <thead id="thead" class="bg-gray-50">
        <tr>
          ${thSort('Nome', 'name', { key: 'name', dir: 'asc' })}
          ${thSort('Descrição', 'description', { key: 'name', dir: 'asc' })}
          ${thSort('# Produtos', 'total_products', { key: 'name', dir: 'asc' })}
          <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
        </tr>
      </thead>
      <tbody id="tbody" class="bg-white"></tbody>
    </table>
  `;
  // rebind sort após recarregar
  container.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      // evento será reatribuído em renderTable()
    });
  });
  renderTable(container, list);
}

export async function render(container) {
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Categorias</h1>
      <button id="btn-new" class="inline-flex items-center gap-2 px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 transition">
        ${icon('plus')} <span>Nova Categoria</span>
      </button>
    </div>

    <div class="bg-white rounded-xl border shadow-sm">
      <div class="p-4 border-b flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[240px] max-w-[420px]">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">${icon('search')}</span>
          <input id="search-input" class="pl-10 pr-3 py-2 w-full rounded border-gray-300" placeholder="Buscar por nome ou descrição...">
        </div>
        <div class="ml-auto text-sm text-gray-600">
          <span id="counter">–</span>
        </div>
      </div>

      <div id="holder" class="overflow-x-auto"></div>

      <div class="p-4 border-t flex items-center justify-end">
        <div id="pager"></div>
      </div>
    </div>
  `;

  const holder = container.querySelector('#holder');
  renderSpinner(holder);

  try {
    await detectBaseEndpoint();
    const list = await fetchCategories();

    // monta tabela inicial + controles
    holder.innerHTML = `
      <table class="min-w-full">
        <thead id="thead" class="bg-gray-50">
          <tr>
            ${thSort('Nome', 'name', { key: 'name', dir: 'asc' })}
            ${thSort('Descrição', 'description', { key: 'name', dir: 'asc' })}
            ${thSort('# Produtos', 'total_products', { key: 'name', dir: 'asc' })}
            <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody id="tbody" class="bg-white"></tbody>
      </table>
    `;

    // inicia renderizador com busca/ordenação/página
    renderTable(container, list);

  } catch (err) {
    holder.innerHTML = `<div class="p-6 text-red-600">Falha ao carregar categorias. ${err?.message || ''}</div>`;
  }

  // criar/editar
  container.querySelector('#btn-new')?.addEventListener('click', () => {
    // state é criado dentro de renderTable; criamos um state mínimo só para reload
    const state = { list: [] };
    openFormModal(container, state, null);
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
}
