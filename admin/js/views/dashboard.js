export function init(container) {
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-sky-100 text-sky-600">
                        <i data-lucide="shopping-cart" class="h-6 w-6"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-500">Total Orders</p>
                        <p class="text-2xl font-bold text-gray-800">1,234</p>
                    </div>
                </div>
            </div>
             <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-emerald-100 text-emerald-600">
                        <i data-lucide="dollar-sign" class="h-6 w-6"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-500">Total Revenue</p>
                        <p class="text-2xl font-bold text-gray-800">$45,678</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-amber-100 text-amber-600">
                        <i data-lucide="users" class="h-6 w-6"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-500">New Customers</p>
                        <p class="text-2xl font-bold text-gray-800">56</p>
                    </div>
                </div>
            </div>
             <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="flex items-center">
                    <div class="p-3 rounded-full bg-red-100 text-red-600">
                        <i data-lucide="alert-triangle" class="h-6 w-6"></i>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-500">Pending Issues</p>
                        <p class="text-2xl font-bold text-gray-800">3</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
             <h2 class="text-xl font-semibold text-gray-700 mb-4">Welcome Back!</h2>
             <p class="text-gray-600">Here's a quick overview of your store. You can manage all aspects of your business from the sidebar navigation.</p>
        </div>
    `;
    lucide.createIcons();
}
