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

const contentRoot = document.getElementById('content-root');

function updateActiveSidebarLink() {
    const hash = window.location.hash || '#dashboard';
    document.querySelectorAll('#sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === hash) {
            link.classList.add('bg-sky-600', 'text-white');
            link.classList.remove('text-sky-100', 'hover:bg-sky-600');
        } else {
            link.classList.remove('bg-sky-600', 'text-white');
            link.classList.add('text-sky-100', 'hover:bg-sky-600');
        }
    });
}

async function router() {
    if (!contentRoot) return;

    const hash = window.location.hash || '#dashboard';
    const view = routes[hash] || routes[''];
    
    if (view && typeof view.init === 'function') {
        try {
            await view.init(contentRoot);
        } catch (error) {
            console.error(`Error initializing view for ${hash}:`, error);
            contentRoot.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load view. Please check the console for details.</div>`;
        }
    } else {
        contentRoot.innerHTML = `<div class="p-8 text-center">Page not found</div>`;
    }
    updateActiveSidebarLink();
}

export function init() {
    window.addEventListener('hashchange', router);
    window.addEventListener('load', router);

    router();
}

export function navigate(hash) {
    window.location.hash = hash;
}
