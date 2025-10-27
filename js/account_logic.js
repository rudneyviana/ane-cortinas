import { initMain } from './main.js';
import { getCurrentUser } from './auth.js';
import { getUserOrders } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    initMain();
    renderAccountPage();
});

async function renderAccountPage() {
    const user = getCurrentUser();
    const container = document.getElementById('account-content');

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    container.innerHTML = `
        <div class="text-center mb-12">
            <h1 class="text-4xl lg:text-5xl font-playfair-display font-bold">Minha Conta</h1>
            <p class="text-stone-600 mt-2">Bem-vindo(a) de volta, ${user.name}!</p>
        </div>
        <div class="max-w-5xl mx-auto">
            <h2 class="text-2xl font-semibold mb-6">Meus Pedidos</h2>
            <div id="orders-list" class="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div class="text-center p-8">
                    <div class="loader"></div>
                    <p class="mt-4 text-stone-600">Carregando seus pedidos...</p>
                </div>
            </div>
        </div>
    `;

    try {
        const orders = await getUserOrders();
        renderOrders(orders);
    } catch(error) {
        console.error("Failed to load orders:", error);
        document.getElementById('orders-list').innerHTML = `<p class="text-center text-red-500">Não foi possível carregar seus pedidos. Tente novamente mais tarde.</p>`;
    }
}

function renderOrders(orders) {
    const ordersListContainer = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        ordersListContainer.innerHTML = `
            <div class="text-center py-8">
                <i data-lucide="archive" class="mx-auto h-16 w-16 text-stone-300 mb-4"></i>
                <p class="text-stone-600">Você ainda não fez nenhum pedido.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    ordersListContainer.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="border-b-2 border-stone-200 text-sm text-stone-600 uppercase">
                    <tr>
                        <th class="p-3">Pedido</th>
                        <th class="p-3">Data</th>
                        <th class="p-3">Total</th>
                        <th class="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(renderOrderRow).join('')}
                </tbody>
            </table>
        </div>
    `;

    lucide.createIcons();
}

function renderOrderRow(order) {
    const statusText = {
        pending: 'Pendente',
        processing: 'Processando',
        shipped: 'Enviado',
        completed: 'Concluído',
        cancelled: 'Cancelado'
    };

    return `
        <tr class="border-b border-stone-100">
            <td class="p-3 font-semibold text-amber-800">#${order.id.toString().padStart(6, '0')}</td>
            <td class="p-3 text-stone-600">${new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
            <td class="p-3 text-stone-800 font-medium">R$ ${parseFloat(order.total_amount).toFixed(2).replace('.', ',')}</td>
            <td class="p-3">
                <span class="status-badge status-${order.status}">${statusText[order.status] || order.status}</span>
            </td>
        </tr>
    `;
}
