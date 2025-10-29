
// Main bootstrap for Admin. No login barrier (bypass auth).
import * as router from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  renderAdminLayout();
  router.init();
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
});

function navLink(hash, label, icon) {
  return `<a href="${hash}" data-route class="flex items-center gap-3 px-3 py-2 rounded hover:bg-stone-700/30 text-stone-200">
    <i data-lucide="${icon}" class="w-5 h-5"></i>
    <span>${label}</span>
  </a>`;
}

function renderAdminLayout() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-stone-800 text-white flex flex-col">
        <div class="h-16 flex items-center px-4 text-xl font-semibold">DecorAdmin</div>
        <nav class="px-2 space-y-1">
          ${navLink('#dashboard', 'Dashboard', 'layout-dashboard')}
          ${navLink('#categories', 'Categorias', 'folder-tree')}
          ${navLink('#products', 'Produtos', 'package')}
          ${navLink('#fabrics', 'Estoque de Tecidos', 'layers')}
          ${navLink('#orders', 'Pedidos', 'shopping-cart')}
          ${navLink('#customers', 'Clientes', 'users')}
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
