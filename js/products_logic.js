import { initMain } from './main.js';
import { getProducts, getCategories } from './api.js';
import { createProductCard } from './components.js';

let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    initMain();
    await loadInitialData();
    setupFilters();
    applyFiltersFromURL();
});

async function loadInitialData() {
    const grid = document.getElementById('products-grid');
    const categoryList = document.getElementById('category-filter-list');
    try {
        const [products, categories] = await Promise.all([getProducts(), getCategories()]);
        allProducts = products;

        if (categories.length > 0) {
            categoryList.innerHTML = `
                <button class="category-btn w-full text-left p-2 rounded-md hover:bg-stone-200 data-[active=true]:bg-amber-100 data-[active=true]:font-semibold" data-category-id="all">Todas</button>
                ${categories.map(c => `
                    <button class="category-btn w-full text-left p-2 rounded-md hover:bg-stone-200 data-[active=true]:bg-amber-100 data-[active=true]:font-semibold" data-category-id="${c.id}">${c.name}</button>
                `).join('')}
            `;
        } else {
            categoryList.innerHTML = '<p class="text-stone-500 text-sm">Nenhuma categoria encontrada.</p>';
        }

        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products or categories:', error);
        grid.innerHTML = '<p class="col-span-full text-red-500">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
        categoryList.innerHTML = '<p class="text-red-500 text-sm">Erro ao carregar categorias.</p>';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const noProductsMessage = document.getElementById('no-products-message');
    grid.innerHTML = '';
    
    if (products.length === 0) {
        noProductsMessage.classList.remove('hidden');
        lucide.createIcons();
    } else {
        noProductsMessage.classList.add('hidden');
        products.forEach(product => {
            grid.appendChild(createProductCard(product));
        });
        lucide.createIcons();
    }
}

function setupFilters() {
    document.getElementById('category-filter-list').addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            applyFilters();
        }
    });
    document.getElementById('price-range').addEventListener('input', e => {
        document.getElementById('price-range-value').textContent = `R$ ${e.target.value}`;
        applyFilters();
    });
    document.getElementById('sort-by').addEventListener('change', applyFilters);
    document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
}

function applyFilters() {
    let products = [...allProducts];

    const activeCategoryBtn = document.querySelector('.category-btn[data-active="true"]');
    if (activeCategoryBtn) activeCategoryBtn.dataset.active = false;
    const clickedCategoryBtn = event.target.closest('.category-btn');
    if(clickedCategoryBtn) clickedCategoryBtn.dataset.active = true;

    const categoryId = clickedCategoryBtn ? clickedCategoryBtn.dataset.categoryId : 'all';
    if (categoryId && categoryId !== 'all') {
        products = products.filter(p => p.category_id == categoryId);
    }
    
    const price = parseFloat(document.getElementById('price-range').value);
    products = products.filter(p => parseFloat(p.price) <= price);

    const sortBy = document.getElementById('sort-by').value;
    switch(sortBy) {
        case 'price-asc':
            products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'name-asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    filteredProducts = products;
    renderProducts(filteredProducts);
}

function clearFilters() {
    document.querySelector('.category-btn[data-active="true"]')?.setAttribute('data-active', 'false');
    const allCatBtn = document.querySelector('.category-btn[data-category-id="all"]');
    if (allCatBtn) allCatBtn.dataset.active = true;

    const priceRange = document.getElementById('price-range');
    priceRange.value = 5000;
    document.getElementById('price-range-value').textContent = `R$ 5000`;
    
    document.getElementById('sort-by').value = 'default';

    renderProducts(allProducts);
}

function applyFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('category_id');

    if (categoryId) {
        const categoryBtn = document.querySelector(`.category-btn[data-category-id="${categoryId}"]`);
        if (categoryBtn) {
            categoryBtn.click();
        }
    } else {
        const allCatBtn = document.querySelector('.category-btn[data-category-id="all"]');
        if (allCatBtn) allCatBtn.dataset.active = true;
    }
}
