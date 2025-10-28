// Minimal UI helpers
export function renderSpinner(container) {
  container.innerHTML = `
    <div class="flex items-center justify-center py-16">
      <svg class="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4"></circle>
      </svg>
      <span>Carregando...</span>
    </div>`;
}

export function showToast(message, type = 'success') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

let _modal;
export function showModal({ title = 'Info', contentHtml = '', footerHtml = '' } = {}) {
  closeModal();
  _modal = document.createElement('div');
  _modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4';
  _modal.innerHTML = `
    <div class="bg-white rounded shadow-lg w-full max-w-lg">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="font-semibold text-lg">${title}</h3>
        <button id="modal-close-btn" class="p-1">&times;</button>
      </div>
      <div class="p-4">${contentHtml}</div>
      <div class="p-4 border-t text-right">${footerHtml}</div>
    </div>`;
  _modal.addEventListener('click', (e) => {
    if (e.target === _modal) closeModal();
  });
  document.body.appendChild(_modal);
  const btn = document.getElementById('modal-close-btn');
  if (btn) btn.addEventListener('click', closeModal);
}

export function closeModal() {
  if (_modal && _modal.parentNode) {
    _modal.parentNode.removeChild(_modal);
  }
  _modal = null;
}