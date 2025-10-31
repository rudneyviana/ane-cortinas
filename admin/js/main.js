// Main bootstrap for Admin. No login barrier (bypass auth).
import * as router from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  renderAdminLayout();
  router.init();
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
});

function renderAdminLayout() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-stone-800 text-stone-100 flex-shrink-0">
        <div class="p-4 text-xl font-bold flex items-center gap-2">
          <i data-lucide="diamonds" class="w-6 h-6"></i>
          Ane Storage
        </div>
        <nav class="flex-1 px-2 py-4 space-y-1">
          <a href="#dashboard" class="flex items-center px-4 py-2 rounded-md font-medium text-stone-100 hover:bg-stone-700">
            <i data-lucide="home" class="mr-3 h-6 w-6"></i> Dashboard
          </a>
          <a href="#categories" class="flex items-center px-4 py-2 rounded-md font-medium text-stone-100 hover:bg-stone-700">
              <i data-lucide="layout-grid" class="mr-3 h-6 w-6"></i> Categorias
          </a>
          <a href="#products" class="flex items-center px-4 py-2 rounded-md font-medium text-stone-100 hover:bg-stone-700">
              <i data-lucide="package" class="mr-3 h-6 w-6"></i> Produtos
          </a>
          <a href="#fabrics" class="flex items-center px-4 py-2 rounded-md font-medium text-stone-100 hover:bg-stone-700">
              <i data-lucide="layers" class="mr-3 h-6 w-6"></i> Estoque de Tecidos
          </a>
          <a href="#orders" class="flex items-center px-4 py-2 rounded-md font-medium text-stone-100 hover:bg-stone-700">
              <i data-lucide="shopping-cart" class="mr-3 h-6 w-6"></i> Pedidos
          </a>
          <a href="#customers" class="flex items-center px-4 py-2 rounded-md font-medium text-stone-100 hover:bg-stone-700">
              <i data-lucide="users" class="mr-3 h-6 w-6"></i> Clientes
          </a>
        </nav>
      </aside>

      <!-- Main panel -->
      <div class="flex-1 flex flex-col">
        <header class="h-16 flex items-center justify-between px-6 bg-white border-b">
          <div class="font-semibold">Admin Dashboard</div>
          <div class="text-sm text-gray-600">Welcome, Admin User</div>
        </header>
        <main id="content-root" class="flex-1 p-6 bg-gray-100 overflow-y-auto"></main>
      </div>
    </div>
  `;
}