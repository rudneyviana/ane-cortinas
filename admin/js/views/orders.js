import * as api from '../api_service.js';
import { renderSpinner, showModal, closeModal, showToast } from '../ui_service.js';

/** ---------------- Helpers ---------------- */
const TRY_ENDPOINTS = ['orders', 'pedidos']; // fallback caso tenha sido traduzido no backend
let BASE = null;

function icon(name, cls='w-4 h-4'){ return `<i data-lucide="${name}" class="${cls}"></i>`; }

function moneyBRL(v){
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

function fmtDate(s){
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString('pt-BR');
}

function statusBadge(st){
  const s = String(st || '').toLowerCase();
  const map = {
    pending:     'bg-amber-100 text-amber-800',
    processing:  'bg-blue-100 text-blue-800',
    shipped:     'bg-purple-100 text-purple-800',
    completed:   'bg-emerald-100 text-emerald-800',
    cancelled:   'bg-rose-100 text-rose-800',
  };
  const label = {
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  }[s] || st || '—';
  const cls = map[s] || 'bg-gray-200 text-gray-700';
  return `<span class="px-2 py-1 rounded text-xs font-medium ${cls}">${label}</span>`;
}

function statusSelect(current){
  const opts = [
    ['pending','Pendente'],
    ['processing','Processando'],
    ['shipped','Enviado'],
    ['completed','Concluído'],
    ['cancelled','Cancelado'],
  ];
  const cur = String(current || '').toLowerCase();
  return `
    <select class="border rounded px-2 py-1 text-sm" data-status-select>
      ${opts.map(([v,l]) => `<option value="${v}" ${cur===v?'selected':''}>${l}</option>`).join('')}
    </select>
  `;
}

// Procura endpoint base funcional (orders/pedidos)
async function resolveBase(){
  if (BASE) return BASE;
  for (const ep of TRY_ENDPOINTS){
    try {
      await api.get(ep);
      BASE = ep;
      return BASE;
    } catch(_) {}
  }
  // por padrão tenta orders mesmo assim
  BASE = 'orders';
  return BASE;
}

function normalizeOrder(o){
  // guest_customer_details pode vir como JSON string ou objeto:
  let guest = o.guest_customer_details ?? o.guest ?? null;
  try { if (typeof guest === 'string') guest = JSON.parse(guest); } catch {}
  const custName = o.customer_name ?? o.customer?.name ?? guest?.name ?? '—';
  const custEmail = o.email ?? o.customer?.email ?? guest?.email ?? '—';
  return {
    id: o.id ?? o.order_id ?? o.codigo,
    customer_name: custName,
    email: custEmail,
    total: Number(o.total_amount ?? o.total ?? 0),
    status: o.status ?? o.situacao ?? 'pending',
    created_at: o.created_at ?? o.data ?? o.createdAt ?? null,
  };
}

function orderRow(o){
  return `
    <tr class="border-b last:border-b-0">
      <td class="px-4 py-3 font-medium text-gray-800">#${o.id}</td>
      <td class="px-4 py-3">
        <div class="font-medium text-gray-800">${o.customer_name}</div>
        <div class="text-xs text-gray-500">${o.email || '—'}</div>
      </td>
      <td class="px-4 py-3 text-gray-700">${moneyBRL(o.total)}</td>
      <td class="px-4 py-3">${statusBadge(o.status)}</td>
      <td class="px-4 py-3 text-gray-700">${fmtDate(o.created_at)}</td>
      <td class="px-4 py-3 text-right flex items-center gap-2 justify-end">
        <button class="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800" data-view="${o.id}">
          ${icon('eye')} <span class="hidden md:inline">Ver</span>
        </button>
        <div class="hidden md:inline-block">${statusSelect(o.status)}</div>
        <button class="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700" data-del="${o.id}">
          ${icon('trash-2')}
        </button>
      </td>
    </tr>
  `;
}

function detailsTable(items=[]){
  if (!Array.isArray(items) || !items.length){
    return `<div class="text-gray-500">Nenhum item no pedido.</div>`;
  }
  return `
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600">
          <tr>
            <th class="px-4 py-3">PRODUTO</th>
            <th class="px-4 py-3">QTD</th>
            <th class="px-4 py-3">PREÇO UN.</th>
            <th class="px-4 py-3">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          ${items.map(it => {
            const name = it.product_name ?? it.name ?? `#${it.product_id}`;
            const q = Number(it.quantity ?? it.qtd ?? 1);
            const up = Number(it.unit_price ?? it.preco_unit ?? it.price ?? 0);
            return `
              <tr class="border-b last:border-b-0">
                <td class="px-4 py-3 text-gray-800">${name}</td>
                <td class="px-4 py-3">${q}</td>
                <td class="px-4 py-3">${moneyBRL(up)}</td>
                <td class="px-4 py-3">${moneyBRL(q*up)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function viewModalHTML(ord){
  const head = `
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-xl font-semibold text-gray-900">Pedido #${ord.id}</h3>
        <p class="text-gray-500">Criado em ${fmtDate(ord.created_at)}</p>
      </div>
      <div>${statusBadge(ord.status)}</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="bg-gray-50 rounded p-4">
        <div class="text-sm text-gray-500 mb-1">Cliente</div>
        <div class="font-medium text-gray-800">${ord.customer_name}</div>
        <div class="text-gray-600">${ord.email || '—'}</div>
      </div>
      <div class="bg-gray-50 rounded p-4">
        <div class="text-sm text-gray-500 mb-1">Total</div>
        <div class="font-semibold text-gray-800">${moneyBRL(ord.total)}</div>
      </div>
    </div>
  `;
  const items = detailsTable(ord.items || []);
  return head + items;
}

/** ---------------- View ---------------- */
export async function init(container){
  container.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Pedidos</h1>
        <p class="text-gray-500 mt-1">Listagem e gerenciamento de pedidos</p>
      </div>
      <div class="hidden md:flex items-center gap-2">
        <button id="btn-refresh" class="inline-flex items-center gap-2 border px-3 py-2 rounded hover:bg-gray-50">
          ${icon('refresh-ccw')} Atualizar
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border mb-4">
      <div class="p-4 grid gap-3 md:grid-cols-3">
        <div class="relative">
          <input id="search" class="w-full px-4 py-2 border rounded-lg" placeholder="Buscar por cliente/email...">
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">${icon('search')}</div>
        </div>
        <div>
          <select id="filStatus" class="w-full px-3 py-2 border rounded-lg">
            <option value="">Status (todos)</option>
            <option value="pending">Pendente</option>
            <option value="processing">Processando</option>
            <option value="shipped">Enviado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button id="clearFilters" class="px-3 py-2 border rounded-lg w-full hover:bg-gray-50">Limpar filtros</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border">
      <div id="list-holder" class="p-6"></div>
    </div>
  `;

  const holder = container.querySelector('#list-holder');
  renderSpinner(holder);

  let data = [];
  let filtered = [];

  async function fetchAll(){
    const base = await resolveBase();
    let list = await api.get(base);
    list = Array.isArray(list) ? list : (list?.data || []);
    return list.map(normalizeOrder);
  }

  function renderTable(items){
    holder.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600">
            <tr>
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">CLIENTE</th>
              <th class="px-4 py-3">TOTAL</th>
              <th class="px-4 py-3">STATUS</th>
              <th class="px-4 py-3">CRIADO</th>
              <th class="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            ${items.map(orderRow).join('')}
          </tbody>
        </table>
      </div>
    `;

    // eventos de ação
    holder.querySelectorAll('[data-view]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-view');
        try {
          const base = await resolveBase();
          const det = await api.get(`${base}/single.php?id=${id}`);
          const ord = normalizeOrder(det);
          ord.items = det.items || [];
          showModal(viewModalHTML(ord), { title: `Pedido #${ord.id}` });
          if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
        } catch(err){
          showToast(`Falha ao abrir detalhes: ${err?.message||''}`, 'error');
        }
      });
    });

    // update de status inline (select)
    holder.querySelectorAll('[data-status-select]').forEach(sel=>{
      sel.addEventListener('change', async (e)=>{
        const tr = e.target.closest('tr');
        const idCell = tr?.querySelector('td:first-child')?.textContent || '';
        const id = (idCell.match(/\d+/)||[])[0];
        const newStatus = e.target.value;
        if (!id) return;
        try {
          const base = await resolveBase();
          const payload = { status: newStatus };
          await api.put(`${base}/single.php?id=${id}`, payload);
          // reflete na UI
          const rowIdx = data.findIndex(x => String(x.id) === String(id));
          if (rowIdx>=0) data[rowIdx].status = newStatus;
          // rerender rápido do badge
          const badgeCell = tr.querySelector('td:nth-child(4)');
          if (badgeCell) badgeCell.innerHTML = statusBadge(newStatus);
          showToast('Status atualizado com sucesso.');
        } catch(err){
          showToast(`Falha ao atualizar status: ${err?.message||''}`, 'error');
          // tenta reverter UI do select
          const cur = data.find(x => String(x.id)===String(id))?.status;
          if (cur) e.target.value = String(cur).toLowerCase();
        }
      });
    });

    // deletar pedido
    holder.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-del');
        if (!confirm(`Excluir o pedido #${id}? Essa ação não pode ser desfeita.`)) return;
        try {
          const base = await resolveBase();
          await api.del(`${base}/single.php?id=${id}`);
          data = data.filter(o => String(o.id)!==String(id));
          applyFilters(); // re-render
          showToast('Pedido excluído.');
        } catch(err){
          showToast(`Falha ao excluir: ${err?.message||''}`, 'error');
        }
      });
    });

    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function applyFilters(){
    const q = (container.querySelector('#search').value || '').toLowerCase();
    const st = (container.querySelector('#filStatus').value || '').toLowerCase();
    filtered = data.filter(o=>{
      const okStatus = !st || String(o.status).toLowerCase()===st;
      const blob = `${o.customer_name||''} ${o.email||''} ${o.id}`.toLowerCase();
      const okSearch = !q || blob.includes(q);
      return okStatus && okSearch;
    });
    renderTable(filtered);
  }

  try {
    data = await fetchAll();
    filtered = [...data];
    renderTable(filtered);
  } catch(err){
    holder.innerHTML = `<div class="text-red-600">Falha ao carregar pedidos. ${err?.message||''}</div>`;
  }

  // filtros
  container.querySelector('#search').addEventListener('input', applyFilters);
  container.querySelector('#filStatus').addEventListener('change', applyFilters);
  container.querySelector('#clearFilters').addEventListener('click', ()=>{
    container.querySelector('#search').value = '';
    container.querySelector('#filStatus').value = '';
    applyFilters();
  });

  // refresh
  container.querySelector('#btn-refresh').addEventListener('click', async ()=>{
    renderSpinner(holder);
    try {
      data = await fetchAll();
      applyFilters();
      showToast('Lista atualizada.');
    } catch(err){
      holder.innerHTML = `<div class="text-red-600">Falha ao atualizar pedidos. ${err?.message||''}</div>`;
    }
  });
}
