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

    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id && JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations));

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        const cartItemId = `cartItem_${Date.now()}`;
        const newItem = { ...item, cartItemId };
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
