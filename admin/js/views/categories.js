
import * as api from '../api_service.js';
import { renderSpinner, showModal, closeModal, showToast } from '../ui_service.js';

function row(c) {
  const total = c.total_products ?? c.total ?? 0;
  return `
  <tr class="border-b last:border-b-0">
    <td class="px-4 py-3 font-medium text-gray-800">${c.name || c.nome}</td>
    <td class="px-4 py-3 text-gray-700">${c.description || c.descricao || '-'}</td>
    <td class="px-4 py-3 text-gray-700">${total}</td>
    <td class="px-4 py-3 text-right">
      <button class="text-sky-700 mr-3" data-edit="${c.id}"><i data-lucide="square-pen" class="w-4 h-4"></i></button>
      <button class="text-red-600" data-del="${c.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </td>
  </tr>`;
}

function formHTML(c = {}) {
  return `
  <form id="cat-form" class="space-y-4">
    <div>
      <label class="block text-sm mb-1">Nome</label>
      <input name="name" class="w-full px-3 py-2 border rounded" value="${c.name || c.nome || ''}" required>
    </div>
    <div>
      <label class="block text-sm mb-1">Descrição</label>
      <textarea name="description" class="w-full px-3 py-2 border rounded">${c.description || c.descricao || ''}</textarea>
    </div>
    <input type="hidden" name="id" value="${c.id || ''}">
  </form>`;
}

async function openFormModal(cat = null) {
  showModal({
    title: cat ? 'Editar Categoria' : 'Nova Categoria',
    contentHtml: formHTML(cat),
    footerHtml: `
      <button id="btn-cancel" class="px-4 py-2 rounded border mr-2">Cancelar</button>
      <button id="btn-save" class="px-4 py-2 rounded bg-amber-600 text-white">Salvar</button>
    `
  });
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-save').addEventListener('click', async () => {
    const fd = new FormData(document.getElementById('cat-form'));
    const payload = Object.fromEntries(fd.entries());
    if (payload.id) {
      const id = payload.id; delete payload.id;
      await api.put(`categories/${id}`, payload);
      showToast('Categoria atualizada');
    } else {
      await api.post('categories', payload);
      showToast('Categoria criada');
    }
    closeModal();
    const root = document.getElementById('content-root');
    init(root);
  });
}

export async function init(container) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Categorias</h1>
      <button id="btn-new" class="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded">
        <i data-lucide="plus"></i> Nova Categoria
      </button>
    </div>
    <div class="bg-white rounded shadow">
      <div class="p-6" id="list-holder"></div>
    </div>
  `;
  const holder = container.querySelector('#list-holder');
  renderSpinner(holder);
  try {
    let list;
    try { list = await api.get('categories'); } catch { list = await api.get('categorias'); }
    list = (list || []).map(c => ({
      id: c.id ?? c.categoria_id,
      name: c.name ?? c.nome,
      description: c.description ?? c.descricao,
      total_products: c.total_products ?? c.total
    }));
    holder.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600">
            <tr>
              <th class="px-4 py-3">NOME</th>
              <th class="px-4 py-3">DESCRIÇÃO</th>
              <th class="px-4 py-3"># PRODUTOS</th>
              <th class="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody id="tbody-cats" class="text-sm"></tbody>
        </table>
      </div>`;
    const tbody = container.querySelector('#tbody-cats');
    tbody.innerHTML = list.map(row).join('');

    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const delId = btn.getAttribute('data-del');
      const editId = btn.getAttribute('data-edit');
      if (delId) {
        if (confirm('Excluir esta categoria?')) {
          await api.del(`categories/${delId}`);
          showToast('Categoria excluída');
          init(container);
        }
      } else if (editId) {
        const cat = list.find(c => String(c.id) === String(editId));
        openFormModal(cat);
      }
    });

  } catch (err) {
    holder.innerHTML = `<div class="text-red-600">Falha ao carregar categorias. ${err?.message || ''}</div>`;
  }

  container.querySelector('#btn-new').addEventListener('click', () => openFormModal());
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}
