import { initMain } from './main.js';
import { getCart, removeFromCart, updateCartItemQuantity } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    initMain();
    renderCart();
});

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-content');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center bg-white p-12 rounded-lg shadow-md">
                <i data-lucide="shopping-cart" class="mx-auto h-20 w-20 text-stone-300 mb-6"></i>
                <h2 class="text-3xl font-playfair-display font-bold text-stone-800">Seu carrinho está vazio</h2>
                <p class="text-stone-600 mt-2 mb-6">Adicione produtos para vê-los aqui.</p>
                <a href="products.html" class="inline-block bg-amber-800 text-white font-semibold py-3 px-8 rounded-md hover:bg-amber-900 transition-colors duration-300">
                    Continuar Comprando
                </a>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8">
            <div class="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
                <ul id="cart-item-list" class="divide-y divide-stone-200">
                    ${cart.map(item => renderCartItem(item)).join('')}
                </ul>
            </div>
            <div class="w-full lg:w-1/3">
                <div class="bg-white p-6 rounded-lg shadow-md sticky top-28">
                    <h2 class="text-xl font-semibold border-b pb-4 mb-4">Resumo do Pedido</h2>
                    <div class="flex justify-between mb-2 text-stone-600">
                        <span>Subtotal</span>
                        <span id="subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between mb-4 text-stone-600">
                        <span>Frete</span>
                        <span>Calculado no checkout</span>
                    </div>
                    <div class="flex justify-between font-bold text-lg border-t pt-4">
                        <span>Total</span>
                        <span id="total">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <a href="checkout.html" class="mt-6 block w-full text-center bg-amber-800 text-white font-semibold py-3 px-4 rounded-md hover:bg-amber-900 transition-colors duration-300">
                        Finalizar Compra
                    </a>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    attachCartEventListeners();
}

function renderCartItem(item) {
    const itemTotal = item.price * item.quantity;
    const imageUrl = item.image_url || item.image || 'https://placehold.co/100x100/f5f5f4/a37336?text=Ane';
    
    // Verificação condicional para customizations
    const customizationsHtml = (item.customizations && item.customizations.length > 0)
        ? `<div class="text-xs text-stone-500 mt-1">${item.customizations.map(c => `<span>${c.label}: ${c.value}</span>`).join('<br>')}</div>`
        : '';
    
    return `
        <li class="py-4 flex gap-4" data-cart-item-id="${item.cartItemId}">
            <img src="${imageUrl}" alt="${item.name}" class="w-24 h-24 object-cover rounded-md">
            <div class="flex-grow">
                <h3 class="font-semibold text-lg">${item.name}</h3>
                ${customizationsHtml}
                 <p class="text-sm text-stone-600 mt-1">R$ ${item.price.toFixed(2).replace('.', ',')} / un.</p>
            </div>
            <div class="flex flex-col items-end justify-between">
                <p class="font-semibold text-lg">R$ ${itemTotal.toFixed(2).replace('.', ',')}</p>
                <div class="flex items-center gap-2">
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input w-16 text-center border border-stone-300 rounded-md py-1">
                    <button class="remove-btn text-stone-500 hover:text-red-600 transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                </div>
            </div>
        </li>
    `;
}

function attachCartEventListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', e => {
            const cartItemId = e.currentTarget.closest('li').dataset.cartItemId;
            removeFromCart(cartItemId);
            renderCart();
            initMain();
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', e => {
            const cartItemId = e.currentTarget.closest('li').dataset.cartItemId;
            const newQuantity = parseInt(e.currentTarget.value);
            if (newQuantity > 0) {
                updateCartItemQuantity(cartItemId, newQuantity);
            } else {
                removeFromCart(cartItemId);
            }
            renderCart();
            initMain();
        });
    });
}