// Simple hash-based router for the Admin
import * as dashboardView from './views/dashboard.js';
import * as categoriesView from './views/categories.js';
import * as productsView from './views/products.js';
import * as fabricsView from './views/fabrics.js';
import * as ordersView from './views/orders.js';
import * as customersView from './views/customers.js';

const routes = {
  '': dashboardView,
  '#dashboard': dashboardView,
  '#categories': categoriesView,
  '#products': productsView,
  '#fabrics': fabricsView,
  '#orders': ordersView,
  '#customers': customersView,
};

function updateActiveSidebarLink() {
  const current = window.location.hash || '#dashboard';
  document.querySelectorAll('[data-admin-link]').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('bg-sky-700', 'text-white');
      a.classList.remove('text-sky-100');
    } else {
      a.classList.remove('bg-sky-700', 'text-white');
      a.classList.add('text-sky-100');
    }
  });
}

export function router() {
  const hash = window.location.hash || '#dashboard';
  const view = routes[hash] || dashboardView;
  const root = document.getElementById('content-root');
  if (!root) return;
  // Clear and render the selected view
  root.innerHTML = '';
  if (view && typeof view.init === 'function') {
    view.init(root);
  } else {
    root.innerHTML = '<div class="p-6 text-red-600">View not found.</div>';
  }
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
  updateActiveSidebarLink();
}

export function init() {
  window.addEventListener('hashchange', router);
  router(); // initial render
}

export function navigate(hash) {
  window.location.hash = hash;
}