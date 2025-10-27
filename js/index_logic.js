import { initMain } from './main.js';
import { getProducts, getCategories } from './api.js';
import { createProductCard } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
    initMain();
    loadFeaturedProducts();
    loadCategories();
});

async function loadFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    try {
        const products = await getProducts();
        const featuredProducts = products.slice(0, 4);

        if(featuredProducts.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-stone-500">Nenhum produto em destaque no momento.</p>';
            return;
        }

        grid.innerHTML = '';
        featuredProducts.forEach(product => {
            grid.appendChild(createProductCard(product));
        });
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading featured products:', error);
        grid.innerHTML = '<p class="col-span-full text-red-500">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
    }
}

async function loadCategories() {
    const grid = document.getElementById('category-grid');
    try {
        const categories = await getCategories();
        const categoryImages = {
            'Cortinas': 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
            'Almofadas': 'https://images.pexels.com/photos/116915/pexels-photo-116915.jpeg?auto=compress&cs=tinysrgb&w=600',
            'Pingentes': 'https://images.pexels.com/photos/6633923/pexels-photo-6633923.jpeg?auto=compress&cs=tinysrgb&w=600'
        };

        if(categories.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-stone-500">Nenhuma categoria encontrada.</p>';
            return;
        }

        grid.innerHTML = categories.map(category => `
            <a href="products.html?category_id=${category.id}" class="group block">
                <div class="relative aspect-video overflow-hidden rounded-lg shadow-lg">
                    <img src="${categoryImages[category.name] || 'https://placehold.co/600x400'}" alt="${category.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                    <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <h3 class="text-2xl font-playfair-display font-bold text-white">${category.name}</h3>
                    </div>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
        grid.innerHTML = '<p class="col-span-full text-red-500">Não foi possível carregar as categorias.</p>';
    }
}
