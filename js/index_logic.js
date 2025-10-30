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
            'Cortinas': 'https://img.freepik.com/fotos-premium/uma-janela-com-cortinas-no-escuro_881868-938.jpg?semt=ais_hybrid&w=740&q=80',
            'Almofadas': 'https://images.tcdn.com.br/img/img_prod/738982/kit_03_capas_de_almofadas_padrao_grego_azul_45x45cm_959_1_61b766c15d959734748dfd5119f934ed.jpg',
            'Pingentes': 'https://cdnm.westwing.com.br/glossary/uploads/br/2015/06/02142404/detalhe-de-cortina-presa-com-um-pingente-em-tassel_c-a1786.jpg'
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
