import { renderSpinner, showToast } from '../ui_service.js';

export function init(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Customers</h1>
            <button id="add-customer-btn" class="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 flex items-center">
                <i data-lucide="plus" class="w-5 h-5 mr-2"></i> Add Customer
            </button>
        </div>
        <div id="customers-content" class="bg-white p-6 rounded-lg shadow-md">
            <!-- Customers content will be rendered here -->
        </div>
    `;
    lucide.createIcons();
    fetchAndRenderCustomers();
}

async function fetchAndRenderCustomers() {
    const contentContainer = document.getElementById('customers-content');
    renderSpinner(contentContainer);


    setTimeout(() => {
        contentContainer.innerHTML = `
             <div class="text-center py-10">
                <i data-lucide="users" class="mx-auto h-12 w-12 text-gray-400"></i>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p class="mt-1 text-sm text-gray-500">The customer management feature is under construction.</p>
                <div class="mt-6">
                    <button type="button" class="inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700">
                        <i data-lucide="plus" class="-ml-1 mr-2 h-5 w-5"></i>
                        Add Customer (Coming Soon)
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
        showToast('Customer API is a placeholder.', 'info');
    }, 1000);
}
