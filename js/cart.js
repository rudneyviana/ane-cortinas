const CART_STORAGE_KEY = 'aneCortinasCart';

export function getCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(item) {
    const cart = getCart();

    // Garantir que customizations sempre existe (array vazio se não houver)
    if (!item.customizations) {
        item.customizations = [];
    }

    // Normalizar options para customizations (compatibilidade com product_detail_logic.js)
    if (item.options && !item.customizations.length) {
        const opts = item.options;
        const customArray = [];
        
        if (opts.height_cm) customArray.push({ label: 'Altura (cm)', value: String(opts.height_cm) });
        if (opts.width_cm) customArray.push({ label: 'Largura (cm)', value: String(opts.width_cm) });
        if (opts.rail_type) customArray.push({ label: 'Tipo de Trilho', value: opts.rail_type });
        if (opts.rail_color) customArray.push({ label: 'Cor do Trilho', value: opts.rail_color });
        if (opts.rail_width_m) customArray.push({ label: 'Largura do Trilho (m)', value: String(opts.rail_width_m) });
        
        item.customizations = customArray;
        delete item.options; // Remove options após converter
    }

    const existingItemIndex = cart.findIndex(cartItem => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.customizations || []) === JSON.stringify(item.customizations || [])
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        const cartItemId = `cartItem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem = { 
            ...item, 
            cartItemId, 
            customizations: item.customizations || [],
            image: item.image_url || item.image || '' // Garantir campo de imagem
        };
        cart.push(newItem);
    }
    
    saveCart(cart);
}

export function removeFromCart(cartItemId) {
    let cart = getCart();
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart(cart);
}

export function updateCartItemQuantity(cartItemId, quantity) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1) {
        if (quantity > 0) {
            cart[itemIndex].quantity = quantity;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveCart(cart);
    }
}

export function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
}