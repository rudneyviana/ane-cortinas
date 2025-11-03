import { initMain } from './main.js';
import { getProductById } from './api.js';
import { addToCart } from './cart.js';

let currentProduct = null;

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (v) => BRL.format(Number.isFinite(+v) ? +v : 0);

const $ = (id) => document.getElementById(id);

function mainImageFrom(p) {
  if (p?.image_url) return p.image_url;
  const first = p?.images?.length ? p.images[0].image_url : null;
  return first || '/ane-cortinas/images/placeholder.png';
}

function isCurtain(p) {
  const cat = (p?.category_name || '').toLowerCase();
  if (cat === 'cortinas') return true;
  return (p?.details?.type) === 'curtain';
}

/* ---------- Toast (com fallback) ---------- */
function toast(msg, type = 'success') {
  // Se existir um showToast global, usa.
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
    return;
  }
  // Fallback minimalista
  let wrap = $('mini-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'mini-toast-wrap';
    wrap.style.cssText = `
      position: fixed; right: 16px; top: 16px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    padding: 10px 14px; border-radius: 8px; color: #fff; font: 500 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    box-shadow: 0 6px 18px rgba(0,0,0,.18); pointer-events: auto; opacity: 0; transform: translateY(-6px);
    transition: opacity .2s ease, transform .2s ease;
    background: ${type === 'error' ? '#dc2626' : '#16a34a'};
  `;
  wrap.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 220);
  }, 2200);
}

function curtainDefaults(p) {
  const d = p?.details || {};
  return {
    rail_type: d.rail_type || 'Varão Branco',
    rail_color: d.rail_color || 'Branco',
    rail_width: Number(d.rail_width ?? 2.00),
    height_cm: '',
    width_cm: '',
  };
}

function renderCurtainFields(p) {
  const c = curtainDefaults(p);
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label class="block text-sm mb-1">Altura (cm)</label>
        <input id="pd-height" type="number" min="0" step="1" class="w-full px-3 py-2 border rounded" value="${c.height_cm}">
      </div>
      <div>
        <label class="block text-sm mb-1">Largura (cm)</label>
        <input id="pd-width" type="number" min="0" step="1" class="w-full px-3 py-2 border rounded" value="${c.width_cm}">
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      <div>
        <label class="block text-sm mb-1">Tipo de Trilho/Varão</label>
        <input id="pd-rail-type" class="w-full px-3 py-2 border rounded" value="${c.rail_type}">
      </div>
      <div>
        <label class="block text-sm mb-1">Cor do Trilho/Varão</label>
        <input id="pd-rail-color" class="w-full px-3 py-2 border rounded" value="${c.rail_color}">
      </div>
    </div>

    <div class="mt-3">
      <label class="block text-sm mb-1">Largura do Trilho (m)</label>
      <input id="pd-rail-width" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded" value="${c.rail_width}">
    </div>
  `;
}

function renderQtyControls() {
  return `
    <div class="inline-flex items-center gap-1 border rounded">
      <button id="pd-qty-dec" type="button" class="px-3 py-2 select-none">−</button>
      <input id="pd-qty" type="number" min="1" step="1" value="1" class="w-14 text-center border-l border-r py-2">
      <button id="pd-qty-inc" type="button" class="px-3 py-2 select-none">+</button>
    </div>
  `;
}

function renderDetail(p) {
  const container = $('product-detail-container');
  const img = mainImageFrom(p);
  const curtain = isCurtain(p);
  const skuHtml = p?.sku ? `<div class="text-sm text-stone-500 mt-1">SKU: ${p.sku}</div>` : '';
  const desc = p?.description ? `<p class="text-stone-700 mt-4">${p.description}</p>` : '';

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div class="w-full aspect-square rounded overflow-hidden bg-stone-100">
          <img id="pd-main-img" src="${img}" alt="" class="w-full h-full object-cover">
        </div>
      </div>

      <div>
        <h1 class="text-3xl font-bold text-stone-900">${p.name}</h1>
        ${skuHtml}
        <div class="text-2xl font-semibold text-amber-700 mt-3">${money(p.price)}</div>
        ${desc}

        <div id="pd-opts" class="mt-5">
          ${curtain ? renderCurtainFields(p) : ''}
        </div>

        <div class="flex items-center gap-3 mt-6">
          ${renderQtyControls()}
          <button id="pd-add" type="button" class="px-5 py-3 rounded bg-amber-700 hover:bg-amber-800 text-white">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  `;

  // binds
  const qtyEl = $('pd-qty');
  $('pd-qty-dec').addEventListener('click', () => {
    const n = Math.max(1, parseInt(qtyEl.value || '1', 10) - 1);
    qtyEl.value = String(n);
  });
  $('pd-qty-inc').addEventListener('click', () => {
    const n = Math.max(1, parseInt(qtyEl.value || '1', 10) + 1);
    qtyEl.value = String(n);
  });

  $('pd-add').addEventListener('click', onAddToCart);
}

function collectOptionsForCart(p) {
  if (!isCurtain(p)) return {};

  const height = Number($('pd-height')?.value || 0);
  const width = Number($('pd-width')?.value || 0);
  const railType = ($('pd-rail-type')?.value || '').trim();
  const railColor = ($('pd-rail-color')?.value || '').trim();
  const railWidth = Number($('pd-rail-width')?.value || 0);

  return {
    height_cm: Number.isFinite(height) && height > 0 ? height : null,
    width_cm: Number.isFinite(width) && width > 0 ? width : null,
    rail_type: railType || null,
    rail_color: railColor || null,
    rail_width_m: Number.isFinite(railWidth) && railWidth > 0 ? railWidth : null,
  };
}

function fireCartUpdated() {
  try { window.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
  try { window.dispatchEvent(new CustomEvent('cartUpdated')); } catch {}
  try { window.dispatchEvent(new CustomEvent('cart-updated')); } catch {}
  try { document.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
  try { window.updateCartUI?.(); } catch {}
}

function localCartFallback(item) {
  try {
    const key = 'cart';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(
      x => x.id === item.id && JSON.stringify(x.options || {}) === JSON.stringify(item.options || {})
    );
    if (idx >= 0) list[idx].quantity += item.quantity;
    else list.push(item);
    localStorage.setItem(key, JSON.stringify(list));
    fireCartUpdated();
    return true;
  } catch (e) {
    console.error('Local cart fallback failed', e);
    return false;
  }
}

async function onAddToCart(e) {
  if (!currentProduct) return;
  const btn = e.currentTarget;
  const qty = Math.max(1, parseInt($('pd-qty')?.value || '1', 10));
  const options = collectOptionsForCart(currentProduct);

  const item = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: Number(currentProduct.price),
    image_url: mainImageFrom(currentProduct),
    quantity: qty,
    sku: currentProduct.sku || null,
    category: currentProduct.category_name || null,
    options,
  };

  btn.disabled = true; btn.classList.add('opacity-70');

  // 1) addToCart(item)
  try {
    const maybePromise = addToCart(item);
    if (maybePromise?.then) await maybePromise;
    toast('Produto adicionado ao carrinho.');
    fireCartUpdated();
    btn.disabled = false; btn.classList.remove('opacity-70');
    return;
  } catch {}

  // 2) addToCart(product, qty, options)
  try {
    const maybePromise = addToCart(currentProduct, qty, options);
    if (maybePromise?.then) await maybePromise;
    toast('Produto adicionado ao carrinho.');
    fireCartUpdated();
    btn.disabled = false; btn.classList.remove('opacity-70');
    return;
  } catch (err) {
    console.warn('addToCart signature not matched, using local fallback.', err);
  }

  // 3) Fallback localStorage
  if (localCartFallback(item)) {
    toast('Produto adicionado ao carrinho.');
  } else {
    toast('Não foi possível adicionar ao carrinho.', 'error');
  }
  btn.disabled = false; btn.classList.remove('opacity-70');
}

/* ---------- Bootstrap ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  initMain();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const container = $('product-detail-container');

  if (!productId) {
    container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado. ID inválido.</p>';
    return;
  }

  try {
    const p = await getProductById(productId);
    if (!p) {
      container.innerHTML = '<p class="text-center text-red-500">Produto não encontrado.</p>';
      return;
    }
    currentProduct = p;
    renderDetail(p);
  } catch (err) {
    console.error('Falha ao carregar produto:', err);
    container.innerHTML = `<p class="text-center text-red-500">Falha ao carregar produto. ${err?.message || ''}</p>`;
  }
});
