import { getCart } from './cart.js';
import { getCurrentUser, logout } from './auth.js';
import { createHeader, createFooter } from './components.js';

export function initMain() {
    const headerContainer = document.getElementById('main-header');
    const footerContainer = document.getElementById('main-footer');
    
    const user = getCurrentUser();
    const cart = getCart();

    if (headerContainer) {
        headerContainer.innerHTML = createHeader(user, cart);
        
        const logoutBtn = document.getElementById('logout-button');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }

    if (footerContainer) {
        footerContainer.innerHTML = createFooter();
    }
    
    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    initMain();
});
