// Simple hash-based router for the Admin (lazy-load views)
const routeLoaders = {
  '': () => import('./views/dashboard.js'),
  '#dashboard': () => import('./views/dashboard.js'),
  '#categories': () => import('./views/categories.js'),
  '#products': () => import('./views/products.js'),
  '#fabrics': () => import('./views/fabrics.js'),
  '#orders': () => import('./views/orders.js'),
  '#customers': () => import('./views/customers.js'),
};

function getCurrentHash() {
  return window.location.hash || '#dashboard';
}

function updateActiveSidebarLink() {
  const current = getCurrentHash();
  document.querySelectorAll('a[data-route]').forEach(a => {
    const isActive = a.getAttribute('href') === current;
    a.classList.toggle('bg-amber-50', isActive);
    a.classList.toggle('text-amber-800', isActive);
    a.classList.toggle('text-stone-200', !isActive);
  });
}

async function router() {
  const hash = getCurrentHash();
  const loader = routeLoaders[hash];
  const root = document.getElementById('content-root');
  if (!root) return;

  if (!loader) {
    root.innerHTML = '<p class="text-red-600">View not found.</p>';
    updateActiveSidebarLink();
    return;
  }

  try {
    const mod = await loader();
    if (!mod || (typeof mod.render !== 'function' && typeof mod.init !== 'function')) {
      root.innerHTML = '<p class="text-red-600">View not found.</p>';
    } else {
      const fn = mod.render || mod.init; await fn(root);
    }
  } catch (err) {
    console.error(err);
    root.innerHTML = '<div class="p-4 text-red-600">Falha ao carregar a view.</div>';
  }
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  updateActiveSidebarLink();
}

export function init() {
  window.addEventListener('hashchange', router);
  router(); // initial render
}

export function navigate(hash) {
  window.location.hash = hash;
}