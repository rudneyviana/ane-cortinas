let modalElement = null;

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const bgColor = type === 'success' ? 'bg-green-500' : (type === 'error' ? 'bg-red-500' : 'bg-blue-500');
    const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info');

    const toast = document.createElement('div');
    toast.className = `flex items-center text-white p-4 rounded-lg shadow-lg ${bgColor} toast-enter`;
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-6 h-6 mr-3"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    requestAnimationFrame(() => {
        toast.classList.add('toast-enter-active');
    });

    setTimeout(() => {
        toast.classList.remove('toast-enter-active');
        toast.classList.add('toast-exit');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

export function showModal(title, contentHtml, footerHtml) {
    closeModal();
    const container = document.getElementById('modal-container');
    if (!container) return;

    modalElement = document.createElement('div');
    modalElement.className = 'modal-backdrop';
    modalElement.id = 'dynamic-modal';

    modalElement.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="text-xl font-semibold text-gray-800">${title}</h3>
                <button id="modal-close-btn" class="text-gray-400 hover:text-gray-600">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            <div class="p-6">${contentHtml}</div>
            <div class="flex justify-end p-4 bg-gray-50 border-t rounded-b-lg">
                ${footerHtml}
            </div>
        </div>
    `;

    container.appendChild(modalElement);
    lucide.createIcons();

    modalElement.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    modalElement.addEventListener('click', (e) => {
        if (e.target.id === 'dynamic-modal') {
            closeModal();
        }
    });
}

export function closeModal() {
    if (modalElement) {
        modalElement.remove();
        modalElement = null;
    }
}

export function renderSpinner(container) {
    if (container) {
        container.innerHTML = `<div class="flex justify-center items-center p-10"><div class="spinner"></div></div>`;
    }
}

export function clearContainer(container) {
    if (container) {
        container.innerHTML = '';
    }
}
