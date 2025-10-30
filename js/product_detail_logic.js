import { initMain } from './main.js';
import { getProductById } from './api.js';
import { addToCart } from './cart.js';

let currentProduct = null;
let currentPrice = 0;

document.addEventListener('DOMContentLoaded', async () => {
    initMain();

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const container = document.getElementById('product-detail-container');

    if (!productId) {
        if (container) container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado. ID inválido.</p>';
        return;
    }

    try {
        currentProduct = await getProductById(productId);

        if (!currentProduct) {
            if (container) container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado.</p>';
            return;
        }

        currentProduct.customizableAttributes = transformDetailsToAttributes(currentProduct);
        currentPrice = parseFloat(currentProduct.price || 0) || 0;

        renderProductDetail();
    } catch (error) {
        console.error('Error fetching product details:', error);
        if (container) container.innerHTML = '<p class="text-center text-red-500">Não foi possível carregar o produto. Tente novamente mais tarde.</p>';
    }
});

function transformDetailsToAttributes(product) {
    if (!product || !product.details) return [];

    const attributes = [];
    if (product.category_name === 'Cortinas') {
        attributes.push({ label: 'Largura (m)', type: 'number', id: 'width', 'data-price-per-unit': '50' });
        attributes.push({ label: 'Altura (m)', type: 'number', id: 'height', 'data-price-per-unit': '30' });
        attributes.push({ label: 'Tipo de Trilho', type: 'select', id: 'rail_type', options: ['Trilho Suíço', 'Varão Cromado', 'Varão Branco'] });
    }
    return attributes;
}

function renderProductDetail() {
    const container = document.getElementById('product-detail-container');

    if (!currentProduct) {
        if (container) container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado.</p>';
        return;
    }

    const imageUrl =
        currentProduct.image_url ||
        currentProduct.images?.[0]?.image_url ||
        'https://placehold.co/600x600/f5f5f4/a37336?text=Ane';

    let customizationHtml = '';
    if (currentProduct.customizableAttributes && currentProduct.customizableAttributes.length > 0) {
        customizationHtml = currentProduct.customizableAttributes.map(attr => {
            let inputHtml = '';
            switch (attr.type) {
                case 'select':
                    inputHtml = `
                        <select id="${attr.id}" data-label="${attr.label}" class="form-input customization-input">
                            ${attr.options.map(opt => `<option value="${opt}" data-price-modifier="0">${opt}</option>`).join('')}
                        </select>
                    `;
                    break;
                case 'number':
                    inputHtml = `<input type="number" id="${attr.id}" data-label="${attr.label}" data-price-per-unit="${attr['data-price-per-unit'] || 0}" class="form-input customization-input" min="0.5" step="0.1" placeholder="Ex: 2.8">`;
                    break;
            }
            return `<div class="mb-4"><label for="${attr.id}" class="block text-sm font-medium text-stone-700 mb-1">${attr.label}</label>${inputHtml}</div>`;
        }).join('');
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <div class="aspect-square bg-stone-100 rounded-lg overflow-hidden shadow-md">
                <img src="${imageUrl}" alt="${currentProduct.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex flex-col justify-center">
                <h1 class="text-3xl lg:text-4xl font-playfair-display font-bold mb-2">${currentProduct.name}</h1>
                <p class="text-sm text-stone-500 mb-4">SKU: PROD-${currentProduct.id.toString().padStart(5, '0')}</p>
                <p id="product-price" class="text-3xl font-bold text-amber-800 mb-6">R$ ${(parseFloat(currentProduct.price || 0) || 0).toFixed(2).replace('.', ',')}</p>
                <div class="prose text-stone-600 mb-6">${currentProduct.description || ''}</div>

                ${customizationHtml ? `<div class="mb-6 border-t pt-6"><h3 class="text-lg font-semibold mb-2">Personalize seu Produto</h3>${customizationHtml}</div>` : ''}

                <div class="flex items-center gap-4 mb-6">
                    <div class="flex items-center border border-stone-300 rounded-md">
                        <button id="qty-minus" class="p-3 text-stone-600 hover:bg-stone-100 rounded-l-md"><i data-lucide="minus"></i></button>
                        <input id="quantity" type="number" value="1" min="1" class="w-12 text-center border-none focus:ring-0">
                        <button id="qty-plus" class="p-3 text-stone-600 hover:bg-stone-100 rounded-r-md"><i data-lucide="plus"></i></button>
                    </div>
                    <button id="add-to-cart-btn" class="flex-grow btn-primary flex items-center justify-center gap-2">
                        <i data-lucide="shopping-cart"></i>
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    `;

    // Ícones
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    attachEventListeners();
    updatePrice();
}

function attachEventListeners() {
    document.querySelectorAll('.customization-input').forEach(input => {
        input.addEventListener('change', updatePrice);
        input.addEventListener('input', updatePrice);
    });

    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const addBtn = document.getElementById('add-to-cart-btn');

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('quantity');
            let qty = parseInt(qtyInput.value, 10);
            if (qty > 1) qtyInput.value = qty - 1;
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('quantity');
            qtyInput.value = (parseInt(qtyInput.value, 10) || 0) + 1;
        });
    }

    if (addBtn) addBtn.addEventListener('click', handleAddToCart);
}

function updatePrice() {
    let price = parseFloat(currentProduct?.price || 0) || 0;

    document.querySelectorAll('.customization-input').forEach(input => {
        if (input.tagName === 'SELECT') {
            const selectedOption = input.options[input.selectedIndex];
            price += parseFloat(selectedOption?.dataset?.priceModifier || 0) || 0;
        } else if (input.type === 'number') {
            const value = parseFloat(input.value) || 0;
            const pricePerUnit = parseFloat(input.dataset.pricePerUnit || 0) || 0;
            price += value * pricePerUnit;
        }
    });

    currentPrice = price;

    const priceEl = document.getElementById('product-price');
    if (priceEl) {
        priceEl.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
}

function handleAddToCart() {
    const qtyInput = document.getElementById('quantity');
    const quantity = Math.max(parseInt(qtyInput?.value, 10) || 1, 1);

    const customizations = [];
    document.querySelectorAll('.customization-input').forEach(input => {
        customizations.push({
            label: input.dataset.label,
            value: input.value
        });
    });

    const item = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentPrice,
        quantity,
        customizations,
        image: currentProduct.image_url || currentProduct.images?.[0]?.image_url || null
    };

    addToCart(item);
    showToast();
    initMain();
}

function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.remove('opacity-0', 'translate-y-3');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-3');
    }, 3000);
}
