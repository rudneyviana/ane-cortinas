import { initMain } from './main.js';
import { login, register } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    initMain();

    const loginTab = document.getElementById('login-tab-btn');
    const registerTab = document.getElementById('register-tab-btn');
    const loginForm = document.getElementById('login-form-container');
    const registerForm = document.getElementById('register-form-container');
    const errorMessageDiv = document.getElementById('error-message');

    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.classList.add('hidden');
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        const result = await login(email, password);

        if (result.success) {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || 'account.html';
            window.location.href = redirectUrl;
        } else {
            errorMessageDiv.textContent = result.message;
            errorMessageDiv.classList.remove('hidden');
        }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.classList.add('hidden');
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        const result = await register({ name, email, password, role: 'CUSTOMER' });

        if (result.success) {
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect') || 'account.html';
            window.location.href = redirectUrl;
        } else {
            errorMessageDiv.textContent = result.message;
            errorMessageDiv.classList.remove('hidden');
        }
    });
});
