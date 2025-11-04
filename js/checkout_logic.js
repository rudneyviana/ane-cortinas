import { initMain } from './main.js';
import { getCart, clearCart } from './cart.js';
import { getCurrentUser } from './auth.js';
import { saveOrder } from './api.js';

let currentStep = 1;
const user = getCurrentUser();
const cart = getCart();

document.addEventListener('DOMContentLoaded', () => {
    initMain();

    if (!user) {
        window.location.href = `login.html?redirect=checkout.html`;
        return;
    }
    if (cart.length === 0) {
        document.getElementById('checkout-steps-container').innerHTML = `
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4">Seu carrinho está vazio</h2>
                <p class="text-stone-600 mb-6">Adicione produtos para finalizar a compra.</p>
                <a href="products.html" class="inline-block bg-amber-800 text-white font-semibold py-3 px-8 rounded-md hover:bg-amber-900">Ver produtos</a>
            </div>
        `;
        document.getElementById('checkout-form').innerHTML = '';
        document.getElementById('order-summary').classList.add('hidden');
        return;
    }

    renderOrderSummary();
    renderStepContent();
});

function renderStepContent() {
    const formContainer = document.getElementById('checkout-form');
    let content = '';
    
    switch (currentStep) {
        case 1:
            content = getIdentificationStep();
            break;
        case 2:
            content = getShippingStep();
            break;
        case 3:
            content = getPaymentStep();
            break;
    }
    
    formContainer.innerHTML = content;
    updateStepIndicator();
    attachStepEventListeners();
}

function getIdentificationStep() {
    return `
        <h2 class="text-2xl font-semibold mb-6">1. Identificação e Endereço</h2>
        <form id="identification-form" class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-stone-700">Nome Completo</label>
                <input type="text" id="name" name="name" class="form-input mt-1" value="${user.name}" required>
            </div>
             <div>
                <label for="email" class="block text-sm font-medium text-stone-700">Email</label>
                <input type="email" id="email" name="email" class="form-input mt-1 bg-stone-100" value="${user.email}" readonly>
            </div>
            <div>
                <label for="street" class="block text-sm font-medium text-stone-700">Endereço</label>
                <input type="text" id="street" name="street" class="form-input mt-1" placeholder="Rua, Número, Bairro" required>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="city" class="block text-sm font-medium text-stone-700">Cidade</label>
                    <input type="text" id="city" name="city" class="form-input mt-1" required>
                </div>
                <div>
                    <label for="zip" class="block text-sm font-medium text-stone-700">CEP</label>
                    <input type="text" id="zip" name="zip" class="form-input mt-1" required>
                </div>
            </div>
             <button type="submit" class="btn-primary mt-6">Continuar para Entrega</button>
        </form>
    `;
}

function getShippingStep() {
    return `
        <h2 class="text-2xl font-semibold mb-6">2. Método de Entrega</h2>
        <div class="space-y-4">
           <label class="block p-4 border border-amber-800 rounded-md cursor-pointer bg-amber-50">
                <div class="flex justify-between">
                    <div>
                        <p class="font-semibold">Entrega Padrão</p>
                        <p class="text-sm text-stone-600">Receba em 5-7 dias úteis</p>
                    </div>
                    <p class="font-semibold">R$ 25,00</p>
                </div>
                <input type="radio" name="shipping" value="25.00" class="hidden" checked>
           </label>
        </div>
        <div class="flex justify-between mt-8">
            <button id="back-btn" class="font-semibold text-amber-800 hover:underline">Voltar</button>
            <button id="next-btn" class="btn-primary !w-auto px-6">Continuar para Pagamento</button>
        </div>
    `;
}

function getPaymentStep() {
    return `
        <h2 class="text-2xl font-semibold mb-6">3. Pagamento</h2>
        <div class="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg mb-6">
            <p>Esta é uma simulação. Nenhum dado de pagamento real é necessário ou será armazenado.</p>
        </div>
        <form id="payment-form" class="space-y-4">
            <div>
                <label for="card-name" class="block text-sm font-medium text-stone-700">Nome no Cartão</label>
                <input type="text" id="card-name" class="form-input mt-1" value="Nome Fictício">
            </div>
            <div>
                <label for="card-number" class="block text-sm font-medium text-stone-700">Número do Cartão</label>
                <input type="text" id="card-number" class="form-input mt-1" value="4242 4242 4242 4242">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="card-expiry" class="block text-sm font-medium text-stone-700">Validade</label>
                    <input type="text" id="card-expiry" class="form-input mt-1" value="12/28">
                </div>
                <div>
                    <label for="card-cvc" class="block text-sm font-medium text-stone-700">CVC</label>
                    <input type="text" id="card-cvc" class="form-input mt-1" value="123">
                </div>
            </div>
        </form>
         <div class="flex justify-between mt-8">
            <button id="back-btn" class="font-semibold text-amber-800 hover:underline">Voltar</button>
            <button id="finish-btn" class="btn-primary !w-auto px-6">Finalizar Pedido</button>
        </div>
    `;
}

function renderOrderSummary() {
    const summaryContainer = document.getElementById('order-summary');
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const itemsHtml = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        // Verificação condicional para customizations
        const customizationsHtml = (item.customizations && item.customizations.length > 0) 
            ? item.customizations.map(c => `<p class="text-xs text-stone-500">${c.label}: ${c.value}</p>`).join('') 
            : '';
        
        return `
            <div class="flex justify-between items-start py-3">
                <div class="flex gap-3">
                    <span class="font-semibold text-stone-600">${item.quantity}x</span>
                    <div>
                        <p class="text-stone-800">${item.name}</p>
                        ${customizationsHtml}
                    </div>
                </div>
                <span class="text-stone-700">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');

    const shipping = 25.00;
    const total = subtotal + shipping;

    summaryContainer.innerHTML = `
        <h2 class="text-xl font-semibold border-b pb-4 mb-4">Resumo do Pedido</h2>
        <div class="divide-y">${itemsHtml}</div>
        <div class="border-t mt-4 pt-4 space-y-2">
            <div class="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="flex justify-between text-stone-600">
                <span>Frete</span>
                <span>R$ ${shipping.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
            </div>
        </div>
    `;
}

function updateStepIndicator() {
    document.querySelectorAll('.step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.toggle('active', stepNum <= currentStep);
    });
}

function attachStepEventListeners() {
    const identificationForm = document.getElementById('identification-form');
    if (identificationForm) {
        identificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sessionStorage.setItem('checkout_customer_name', document.getElementById('name').value);
            sessionStorage.setItem('checkout_address', document.getElementById('street').value);
            sessionStorage.setItem('checkout_city', document.getElementById('city').value);
            sessionStorage.setItem('checkout_zip', document.getElementById('zip').value);
            currentStep = 2;
            renderStepContent();
        });
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            currentStep--;
            renderStepContent();
        });
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentStep++;
            renderStepContent();
        });
    }

    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', handleFinishOrder);
    }
}

async function handleFinishOrder() {
    const summaryContainer = document.getElementById('order-summary');
    const totalText = summaryContainer.querySelector('.font-bold.text-lg span:last-child').textContent;
    const totalAmount = parseFloat(totalText.replace('R$', '').trim().replace('.', '').replace(',', '.'));
    const customerName = sessionStorage.getItem('checkout_customer_name');
    const street = sessionStorage.getItem('checkout_address');
    const city = sessionStorage.getItem('checkout_city');
    const zipCode = sessionStorage.getItem('checkout_zip');

    if (!customerName || !street || !city || !zipCode) {
        alert("Por favor, preencha seus dados de identificação e endereço.");
        currentStep = 1;
        renderStepContent();
        return;
    }

    const newOrder = {
        customer_id: user.id,
        total_amount: totalAmount,
        status: 'processing',
        guest_customer_details: {
            name: customerName,
            email: user.email,
            address: {
                street: street,
                city: city,
                zipCode: zipCode
            }
        },
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            item_details_json: (item.customizations && item.customizations.length > 0) ? item.customizations : null
        }))
    };

    try {
        const result = await saveOrder(newOrder);
        if (result && result.id) {
            clearCart();
            sessionStorage.removeItem('checkout_customer_name');
            sessionStorage.removeItem('checkout_address');
            sessionStorage.removeItem('checkout_city');
            sessionStorage.removeItem('checkout_zip');
            document.getElementById('success-modal').classList.add('flex');
            document.getElementById('success-modal').classList.remove('hidden');
            lucide.createIcons();
            initMain();
        } else {
            throw new Error('Falha ao criar o pedido. Resposta da API inválida.');
        }
    } catch (error) {
        console.error('Failed to save order:', error);
        alert(`Erro ao finalizar pedido: ${error.message}`);
    }
}