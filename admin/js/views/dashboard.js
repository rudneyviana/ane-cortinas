// admin/js/views/dashboard.js
import * as api from '../api_service.js';
import { renderSpinner, showToast } from '../ui_service.js';

/* ---------------- Helpers ---------------- */
const EP = {
  products:  ['products', 'produtos'],
  orders:    ['orders', 'pedidos'],
  customers: ['customers', 'clientes', 'users', 'usuarios'],
};

function icon(name, cls='w-10 h-10'){ return `<i data-lucide="${name}" class="${cls}"></i>`; }

function moneyBRL(v){
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(s){
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}

async function tryGetFirst(list){
  for (const path of list){
    try { return await api.get(path); } catch(_) {}
  }
  // último fallback tenta o primeiro mesmo assim (p/ dev)
  try { return await api.get(list[0]); } catch(_) { return null; }
}

function statusBadge(st){
  const s = String(st || '').toLowerCase();
  const map = {
    pending:     'bg-yellow-100 text-yellow-700',
    pendente:    'bg-yellow-100 text-yellow-700',
    paid:        'bg-emerald-100 text-emerald-700',
    pago:        'bg-emerald-100 text-emerald-700',
    cancelled:   'bg-red-100 text-red-700',
    cancelado:   'bg-red-100 text-red-700',
    processing:  'bg-blue-100 text-blue-700',
    processando: 'bg-blue-100 text-blue-700',
  };
  const cls = map[s] || 'bg-gray-100 text-gray-700';
  const label = s ? (s[0].toUpperCase() + s.slice(1)) : '—';
  return `<span class="px-2 py-1 rounded text-xs font-medium ${cls}">${label}</span>`;
}

/* ---------------- View ---------------- */
export async function init(container) {
  container.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <button id="dash-reload" class="inline-flex items-center gap-2 px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i><span>Atualizar</span>
      </button>
    </div>

    <!-- KPIs -->
    <div id="kpis" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"></div>

    <!-- Seção útil -->
    <div class="bg-white rounded shadow border">
      <div class="px-5 py-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">Últimos pedidos</h2>
        <a href="#orders" class="text-sm text-emerald-700 hover:underline inline-flex items-center gap-2">
          <span>Ver todos</span><i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
      </div>
      <div id="recent-body" class="border-t">
        <div class="p-6 text-gray-500">Carregando dados…</div>
      </div>
    </div>
  `;

  const reloadBtn = container.querySelector('#dash-reload');
  reloadBtn?.addEventListener('click', () => loadData(container));

  await loadData(container);
}

async function loadData(container){
  const kpis = container.querySelector('#kpis');
  const recent = container.querySelector('#recent-body');
  renderSpinner(recent);

  // Busca concorrente: products, orders, customers
  const [products, orders, customers] = await Promise.all([
    tryGetFirst(EP.products).catch(() => null),
    tryGetFirst(EP.orders).catch(() => null),
    tryGetFirst(EP.customers).catch(() => null),
  ]);

  // Normalizações seguras
  const listProducts  = Array.isArray(products)  ? products  : [];
  const listOrders    = Array.isArray(orders)    ? orders    : [];
  const listCustomers = Array.isArray(customers) ? customers : [];

  // ---- KPIs
  const today = new Date();
  const isSameDay = (d) => {
    const x = new Date(d);
    return !isNaN(x.getTime()) &&
           x.getDate() === today.getDate() &&
           x.getMonth() === today.getMonth() &&
           x.getFullYear() === today.getFullYear();
  };
  const isSameMonth = (d) => {
    const x = new Date(d);
    return !isNaN(x.getTime()) &&
           x.getMonth() === today.getMonth() &&
           x.getFullYear() === today.getFullYear();
  };

  // vendas hoje
  const salesToday = listOrders
    .filter(o => isSameDay(o.created_at || o.data || o.createdAt))
    .reduce((sum, o) => sum + Number(o.total_amount ?? o.total ?? 0), 0);

  // pedidos pendentes
  const pendingCount = listOrders
    .filter(o => {
      const s = String(o.status ?? o.situacao ?? '').toLowerCase();
      return ['pending', 'pendente', 'processing', 'processando'].includes(s);
    }).length;

  // novos clientes no mês
  const newCustomersMonth = listCustomers
    .filter(c => isSameMonth(c.created_at || c.data || c.createdAt)).length;

  // total de produtos
  const totalProducts = listProducts.length;

  kpis.innerHTML = `
    ${KpiCard({
      title: 'Vendas (Hoje)',
      value: moneyBRL(salesToday),
      icon: icon('dollar-sign'),
      iconBg: 'bg-emerald-50 text-emerald-600'
    })}
    ${KpiCard({
      title: 'Pedidos Pendentes',
      value: String(pendingCount),
      icon: icon('package'),
      iconBg: 'bg-yellow-50 text-yellow-600'
    })}
    ${KpiCard({
      title: 'Novos Clientes (Mês)',
      value: String(newCustomersMonth),
      icon: icon('users'),
      iconBg: 'bg-blue-50 text-blue-600'
    })}
    ${KpiCard({
      title: 'Total de Produtos',
      value: String(totalProducts),
      icon: icon('grid'),
      iconBg: 'bg-purple-50 text-purple-600'
    })}
  `;

  // ---- Seção útil: últimos pedidos
  if (!listOrders.length){
    recent.innerHTML = `<div class="p-6 text-gray-500">Sem pedidos para exibir.</div>`;
    return;
  }

  // ordena por data desc (quando possível)
  const parseTime = (o) => {
    const d = new Date(o.created_at || o.data || o.createdAt || 0);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };
  const latest = [...listOrders].sort((a,b) => parseTime(b) - parseTime(a)).slice(0, 5);

  recent.innerHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left text-gray-600 border-b">
            <th class="px-5 py-3 font-medium">PEDIDO ID</th>
            <th class="px-5 py-3 font-medium">DATA</th>
            <th class="px-5 py-3 font-medium">CLIENTE</th>
            <th class="px-5 py-3 font-medium">TOTAL</th>
            <th class="px-5 py-3 font-medium">STATUS</th>
            <th class="px-5 py-3 font-medium text-right">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          ${latest.map(orderRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function KpiCard({ title, value, icon, iconBg }){
  return `
    <div class="bg-white rounded shadow border p-5 flex items-center gap-4">
      <div class="shrink-0 ${iconBg} rounded-full w-14 h-14 flex items-center justify-center">
        ${icon}
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-1">${title}</div>
        <div class="text-2xl font-semibold text-gray-800">${value}</div>
      </div>
    </div>
  `;
}

function orderRow(o){
  const id   = o.id ?? o.order_id ?? o.codigo ?? '—';
  const date = fmtDate(o.created_at || o.data || o.createdAt);
  const guest = o.guest_customer_details || o.guest || {};
  const customer = o.customer_name || o.customer?.name || guest?.name || '—';
  const total = moneyBRL(o.total_amount ?? o.total ?? 0);
  return `
    <tr class="border-b last:border-b-0">
      <td class="px-5 py-3 font-medium text-gray-800">#${id}</td>
      <td class="px-5 py-3 text-gray-700">${date}</td>
      <td class="px-5 py-3 text-gray-700">${customer}</td>
      <td class="px-5 py-3 text-gray-900">${total}</td>
      <td class="px-5 py-3">${statusBadge(o.status ?? o.situacao)}</td>
      <td class="px-5 py-3">
        <div class="flex items-center gap-3 justify-end text-gray-600">
          <a href="#orders" title="Ver pedido"><i data-lucide="eye" class="w-4 h-4"></i></a>
          <a href="#orders" title="Editar"><i data-lucide="pencil" class="w-4 h-4"></i></a>
          <button type="button" class="text-red-600 opacity-60 cursor-not-allowed" title="Remover (via tela de pedidos)">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}
