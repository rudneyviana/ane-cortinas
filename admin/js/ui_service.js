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
  const host = document.getElementById('toast-container') || document.body;
  const el = document.createElement('div');
  el.className = `px-3 py-2 rounded shadow text-white mb-2 ${type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

let _modal = null;

export function showModal({ title = '', contentHtml = '', footerHtml = '' }) {
  closeModal();
  _modal = document.createElement('div');
  _modal.className = 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4';
  _modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div class="px-5 py-4 border-b flex items-center justify-between">
        <h3 class="font-semibold">${title || ''}</h3>
        <button id="modal-close-btn" class="text-stone-500 hover:text-stone-800">&times;</button>
      </div>
      <div class="p-5">${contentHtml || ''}</div>
      <div class="px-5 py-4 border-t text-right">${footerHtml || ''}</div>
    </div>`;
  _modal.addEventListener('click', (e) => {
    if (e.target === _modal) closeModal();
  });
  document.body.appendChild(_modal);
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
}

export function closeModal() {
  if (_modal && _modal.parentNode) _modal.parentNode.removeChild(_modal);
  _modal = null;
}