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
      <aside class="w-64 bg-sky-800 text-sky-100 flex-shrink-0">
        <div class="p-4 text-xl font-bold flex items-center gap-2">
          <i data-lucide="diamonds" class="w-6 h-6"></i>
          DecorAdmin
        </div>
        <nav class="mt-4 flex flex-col">
          <a data-admin-link href="#dashboard" class="px-4 py-3 hover:bg-sky-700">Dashboard</a>
          <a data-admin-link href="#categories" class="px-4 py-3 hover:bg-sky-700">Categories</a>
          <a data-admin-link href="#products" class="px-4 py-3 hover:bg-sky-700">Products</a>
          <a data-admin-link href="#fabrics" class="px-4 py-3 hover:bg-sky-700">Stock / Fabrics</a>
          <a data-admin-link href="#orders" class="px-4 py-3 hover:bg-sky-700">Orders</a>
          <a data-admin-link href="#customers" class="px-4 py-3 hover:bg-sky-700">Clientes</a>
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