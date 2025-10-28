export function createHeader(user, cart) {
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const userActions = user
        ? `
            <div class="relative group">
                <a href="account.html" class="flex items-center gap-2 text-stone-600 hover:text-amber-800 transition-colors">
                    <i data-lucide="user-circle-2"></i>
                    <span>${user.name.split(' ')[0]}</span>
                </a>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <a href="account.html" class="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">Minha Conta</a>
                    ${user.role === 'ADMIN' ? '<a href="admin/index.html" class="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">Painel Admin</a>' : ''}
                    <a href="#" id="logout-button" class="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">Sair</a>
                </div>
            </div>
        `
        : `<a href="login.html" class="flex items-center gap-2 text-stone-600 hover:text-amber-800 transition-colors"><i data-lucide="user"></i><span>Login</span></a>`;
    
    return `
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-20">
                <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
                    <a href="index.html" class="text-stone-600 hover:text-amber-800 transition-colors">Início</a>
                    <a href="products.html" class="text-stone-600 hover:text-amber-800 transition-colors">Produtos</a>
                    <a href="about.html" class="text-stone-600 hover:text-amber-800 transition-colors">Sobre Nós</a>
                </nav>
                <div class="text-2xl font-playfair-display font-bold text-stone-800 absolute left-1/2 -translate-x-1/2">
                    <a href="index.html">Ane Cortinas</a>
                </div>
                <div class="flex items-center gap-4">
                    ${userActions}
                    <a href="cart.html" class="relative flex items-center gap-2 text-stone-600 hover:text-amber-800 transition-colors">
                        <i data-lucide="shopping-cart"></i>
                        ${cartItemCount > 0 ? `<span class="absolute -top-2 -right-2 bg-amber-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">${cartItemCount}</span>` : ''}
                    </a>
                </div>
            </div>
        </div>
    `;
}

export function createFooter() {
    return `
        <div class="container mx-auto px-4 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div class="md:col-span-2 lg:col-span-1">
                    <h3 class="text-xl font-playfair-display font-bold text-white mb-4">Ane Cortinas</h3>
                    <p class="text-stone-400 text-sm">Elegância a cada dobra. Transformando lares com design e sofisticação desde 2010.</p>
                </div>
                <div>
                    <h3 class="font-semibold text-white tracking-wider uppercase mb-4">Navegação</h3>
                    <ul class="space-y-2 text-sm">
                        <li><a href="index.html" class="text-stone-400 hover:text-white transition-colors">Início</a></li>
                        <li><a href="products.html" class="text-stone-400 hover:text-white transition-colors">Produtos</a></li>
                        <li><a href="about.html" class="text-stone-400 hover:text-white transition-colors">Sobre Nós</a></li>
                        <li><a href="account.html" class="text-stone-400 hover:text-white transition-colors">Minha Conta</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold text-white tracking-wider uppercase mb-4">Suporte</h3>
                    <ul class="space-y-2 text-sm">
                        <li><a href="#" class="text-stone-400 hover:text-white transition-colors">FAQ</a></li>
                        <li><a href="#" class="text-stone-400 hover:text-white transition-colors">Política de Privacidade</a></li>
                        <li><a href="#" class="text-stone-400 hover:text-white transition-colors">Termos de Serviço</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="font-semibold text-white tracking-wider uppercase mb-4">Conecte-se</h3>
                    <div class="flex space-x-4">
                        <a href="#" class="text-stone-400 hover:text-white transition-colors"><i data-lucide="facebook"></i></a>
                        <a href="#" class="text-stone-400 hover:text-white transition-colors"><i data-lucide="instagram"></i></a>
                        <a href="#" class="text-stone-400 hover:text-white transition-colors"><i data-lucide="twitter"></i></a>
                    </div>
                </div>
            </div>
            <div class="mt-12 border-t border-stone-700 pt-8 text-center text-sm text-stone-500">
                <p>&copy; ${new Date().getFullYear()} Ane Cortinas e Decorações LTDA. Todos os direitos reservados.</p>
            </div>
        </div>
    `;
}

export function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'group relative flex flex-col bg-white border border-stone-200/80 rounded-lg overflow-hidden transition-shadow hover:shadow-xl';
    
    const imageUrl = product.images?.[0]?.image_url || 'https://placehold.co/400x400/f5f5f4/a37336?text=Ane';

    card.innerHTML = `
        <div class="aspect-square overflow-hidden bg-stone-100">
            <a href="product_detail.html?id=${product.id}">
                <img src="${imageUrl}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </a>
        </div>
        <div class="p-4 flex flex-col flex-grow">
            <h3 class="text-lg font-semibold text-stone-800 truncate">${product.name}</h3>
            <p class="text-sm text-stone-500 mb-4">${product.category_name || ''}</p>
            <div class="mt-auto flex justify-between items-center">
                <p class="text-lg font-bold text-amber-800">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</p>
                <a href="product_detail.html?id=${product.id}" class="text-amber-800 hover:text-amber-900 transition-colors">
                    <i data-lucide="arrow-right-circle"></i>
                </a>
            </div>
        </div>
    `;
    return card;
}
