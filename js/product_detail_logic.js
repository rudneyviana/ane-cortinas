import { initMain } from './main.js';
import { getProductById } from './api.js';
import { addToCart } from './cart.js';

let currentProduct = null;

function moneyBRL(n) {
  const v = Number(n ?? 0);
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// --- Galeria (apenas uma imagem, sem miniaturas) ---
function galleryHTML(images) {
  const main = images?.[0]?.image_url || images?.[0] || null;

  if (!main) {
    return `
      <div class="aspect-square w-full max-w-[560px] mx-auto overflow-hidden rounded-lg border bg-stone-100"></div>
    `;
  }

  return `
    <div class="aspect-square w-full max-w-[560px] mx-auto overflow-hidden rounded-lg border bg-white">
      <img src="${main}" alt="" class="w-full h-full object-cover object-center select-none" />
    </div>
  `;
}

// --- Formulário de detalhes (apenas para cortinas) ---
function detailsFormHTML(p) {
  const d = p.details || {};
  const isCurtain = (d.type === 'curtain') || (String(p.category_name || '').toLowerCase() === 'cortinas');

  if (!isCurtain) return '';

  const safe = v => (v === null || v === undefined ? '' : String(v));

  return `
    <form id="pd-form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-stone-600 mb-1">Altura (cm)</label>
          <input name="height" type="number" step="0.01" min="0" value="${safe(d.height)}" class="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm text-stone-600 mb-1">Largura (cm)</label>
          <input name="width" type="number" step="0.01" min="0" value="${safe(d.width)}" class="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm text-stone-600 mb-1">Tipo de Trilho/Varão</label>
          <input name="rail_type" value="${safe(d.rail_type)}" class="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm text-stone-600 mb-1">Cor do Trilho/Varão</label>
          <input name="rail_color" value="${safe(d.rail_color)}" class="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm text-stone-600 mb-1">Largura do Trilho (m)</label>
          <input name="rail_width" type="number" step="0.01" min="0" value="${safe(d.rail_width)}" class="w-full px-3 py-2 border rounded" />
        </div>
      </div>
    </form>
  `;
}

function quantityHTML() {
  return `
    <div class="inline-flex items-center border rounded overflow-hidden">
      <button id="qty-dec" class="px-3 py-2" type="button">−</button>
      <input id="qty" type="number" min="1" value="1" class="w-14 text-center border-l border-r py-2">
      <button id="qty-inc" class="px-3 py-2" type="button">+</button>
    </div>
  `;
}

function renderProductDetail(p) {
  const container = document.getElementById('product-detail-container');
  const images = (p.images && p.images.length)
    ? p.images
    : (p.image_url ? [{ image_url: p.image_url }] : []);

  container.innerHTML = `
    <div class="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div id="pd-gallery">${galleryHTML(images)}</div>

      <div>
        <h1 class="text-4xl font-extrabold text-stone-900 mb-2">${p.name}</h1>
        ${p.sku ? `<div class="text-sm text-stone-500 mb-4">SKU: ${p.sku}</div>` : ''}
        <div class="text-2xl font-semibold text-amber-700 mb-6">${moneyBRL(p.base_price ?? p.price)}</div>
        ${p.description ? `<p class="text-stone-700 leading-relaxed mb-6">${p.description}</p>` : ''}

        ${detailsFormHTML(p)}

        <div class="mt-6 flex items-center gap-4">
          ${quantityHTML()}
          <button id="btn-add" class="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-3 rounded">
            <i data-lucide="shopping-cart"></i> Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  `;

  // Quantidade
  const qtyEl = document.getElementById('qty');
  document.getElementById('qty-inc').addEventListener('click', () => {
    qtyEl.value = Math.max(1, Number(qtyEl.value || 1) + 1);
  });
  document.getElementById('qty-dec').addEventListener('click', () => {
    qtyEl.value = Math.max(1, Number(qtyEl.value || 1) - 1);
  });

  // Adicionar ao carrinho
  document.getElementById('btn-add').addEventListener('click', () => {
    const qty = Math.max(1, Number(qtyEl.value || 1));
    const form = document.getElementById('pd-form');
    const extras = form ? Object.fromEntries(new FormData(form).entries()) : {};
    const main = images?.[0]?.image_url || images?.[0] || null;

    addToCart({
      id: p.id,
      name: p.name,
      price: Number(p.base_price ?? p.price ?? 0),
      image: main,
      qty,
      extras
    });
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', async () => {
  initMain();

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get('id') || 0);
  const container = document.getElementById('product-detail-container');

  if (!productId) {
    container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado. ID inválido.</p>';
    return;
  }

  try {
    currentProduct = await getProductById(productId);
    if (!currentProduct) {
      container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado.</p>';
      return;
    }
    renderProductDetail(currentProduct);
  } catch (e) {
    container.innerHTML = `<p class="text-center text-red-500">Erro ao carregar produto. ${e?.message || ''}</p>`;
  }
});
