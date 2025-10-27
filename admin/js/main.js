import * as auth from './auth.js';
import * as router from './router.js';
import { showToast } from './ui_service.js';

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    const appContainer = document.getElementById('app');
    
    try {
        const authenticated = await auth.isAuthenticated();
        if (authenticated) {
            renderAdminLayout(appContainer);
            router.init();
        } else {
            renderLoginPage(appContainer);
        }
    } catch (error) {
        console.error("Initialization error:", error);
        renderLoginPage(appContainer);
        showToast('Session expired or invalid. Please log in again.', 'error');
    }
});

function renderLoginPage(container) {
    container.innerHTML = `
        <div class="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div class="w-full max-w-md space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
                </div>
                <form id="login-form" class="mt-8 space-y-6" action="#" method="POST">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label for="email-address" class="sr-only">Email address</label>
                            <input id="email-address" name="email" type="email" autocomplete="email" required class="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" placeholder="Email address" value="admin@example.com">
                        </div>
                        <div>
                            <label for="password" class="sr-only">Password</label>
                            <input id="password" name="password" type="password" autocomplete="current-password" required class="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" placeholder="Password" value="password">
                        </div>
                    </div>

                    <div>
                        <button type="submit" class="group relative flex w-full justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i data-lucide="lock" class="h-5 w-5 text-sky-400 group-hover:text-sky-300"></i>
                            </span>
                            Sign in
                        </button>
                    </div>
                </form>
                 <p id="login-error" class="mt-2 text-center text-sm text-red-600 hidden"></p>
            </div>
        </div>
    `;
    lucide.createIcons();
    
    const form = document.getElementById('login-form');
    form.addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email-address').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    const button = event.target.querySelector('button[type="submit"]');

    button.disabled = true;
    button.innerHTML += ' <div class="spinner !w-4 !h-4 !border-2 ml-2"></div>';
    errorEl.classList.add('hidden');

    try {
        await auth.login(email, password);
        window.location.reload();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
        button.disabled = false;
        button.querySelector('.spinner').remove();
    }
}


function renderAdminLayout(container) {
    const user = auth.getUser();
    container.innerHTML = `
        <div class="flex h-full">
            <!-- Sidebar -->
            <div class="w-64 bg-sky-800 text-white flex flex-col">
                <div class="flex items-center justify-center h-16 border-b border-sky-700">
                    <i data-lucide="gem" class="h-8 w-8 text-white"></i>
                    <span class="ml-3 text-2xl font-bold">DecorAdmin</span>
                </div>
                <nav id="sidebar-nav" class="flex-1 px-2 py-4 space-y-1">
                    <a href="#dashboard" class="flex items-center px-4 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-600">
                        <i data-lucide="home" class="mr-3 h-6 w-6"></i> Dashboard
                    </a>
                    <a href="#categories" class="flex items-center px-4 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-600">
                        <i data-lucide="layout-grid" class="mr-3 h-6 w-6"></i> Categories
                    </a>
                    <a href="#products" class="flex items-center px-4 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-600">
                        <i data-lucide="package" class="mr-3 h-6 w-6"></i> Products
                    </a>
                    <a href="#fabrics" class="flex items-center px-4 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-600">
                        <i data-lucide="layers" class="mr-3 h-6 w-6"></i> Stock / Fabrics
                    </a>
                    <a href="#orders" class="flex items-center px-4 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-600">
                        <i data-lucide="shopping-cart" class="mr-3 h-6 w-6"></i> Orders
                    </a>
                    <a href="#customers" class="flex items-center px-4 py-2 rounded-md text-sm font-medium text-sky-100 hover:bg-sky-600">
                        <i data-lucide="users" class="mr-3 h-6 w-6"></i> Customers
                    </a>
                </nav>
            </div>

            <!-- Main content -->
            <div class="flex-1 flex flex-col">
                <header class="flex justify-between items-center h-16 bg-white border-b px-6">
                    <div>
                        <!-- Search bar or breadcrumbs can go here -->
                    </div>
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-700 mr-4">Welcome, ${user ? user.name : 'Admin'}</span>
                        <button id="logout-btn" class="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                            <i data-lucide="log-out" class="h-6 w-6"></i>
                        </button>
                    </div>
                </header>
                <main id="content-root" class="flex-1 p-6 bg-gray-100 overflow-y-auto">
                    <!-- Dynamic content is rendered here by the router -->
                </main>
            </div>
        </div>
    `;
    lucide.createIcons();
    document.getElementById('logout-btn').addEventListener('click', auth.logout);
}
