const WA_NUMBER = "5581984195038";
const STORE_NAME = "AL ELÉTRICA, HIDRÁULICA & PARAFUSO";
const CITY = "TAMANDARÉ-PE";

const PROD_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'>
  <defs>
    <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='#1a1230'/>
      <stop offset='1' stop-color='#0b0611'/>
    </linearGradient>
  </defs>
  <rect width='600' height='420' fill='url(#g)'/>
  <g fill='none' stroke='rgba(255,255,255,.22)' stroke-width='2'>
    <rect x='130' y='105' width='340' height='210' rx='18'/>
    <path d='M170 255l70-70 70 70 60-60 70 70'/>
    <circle cx='245' cy='180' r='20'/>
  </g>
  <text x='50%' y='86%' text-anchor='middle' fill='rgba(255,255,255,.62)' font-family='Arial' font-size='18'>Sem imagem</text>
</svg>`);

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function brl(v) {
  return (v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function productImageSrc(p) {
  return p.image || `img/products/${p.id}.jpg`;
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("AL_CART") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("AL_CART", JSON.stringify(cart));
}

function addToCart(id) {
  let cart = loadCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  toast("Adicionado ao carrinho!");
  updateBadges();
}

function setQty(id, qty) {
  let cart = loadCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, qty);
  cart = cart.filter((i) => i.qty > 0);
  saveCart(cart);
}

function removeItem(id) {
  let cart = loadCart();
  cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
}

function productCard(p) {
  return `
  <div class="prod">
    <div class="prod-media">
      <img class="prod-img" src="${productImageSrc(p)}" alt="${escapeHtml(
        p.name,
      )}" loading="lazy" onerror="this.onerror=null;this.src=PROD_PLACEHOLDER;" />
    </div>
    <div class="meta">
      <span class="badge">${escapeHtml(p.category)}</span>
      <span class="price">${brl(p.price)}</span>
    </div>
    <h3>${escapeHtml(p.name)}</h3>

    <!-- ✅ TEMPORÁRIO: MOSTRAR CÓDIGO/ID -->
    <div class="small" style="opacity:.75">Cód.: <b>${escapeHtml(
      p.id,
    )}</b></div>

    <div class="small">${escapeHtml(p.desc || "")}</div>
    <div class="row" style="margin-top:auto;justify-content:space-between;align-items:center">
      <span class="small">Unid.: ${escapeHtml(p.unit)}</span>
      <button class="btn primary" data-add="${p.id}">Adicionar</button>
    </div>
  </div>`;
}

function renderFeatured() {
  const host = document.querySelector("[data-featured]");
  if (!host) return;
  const picks = window.PRODUCTS.slice(0, 8);
  host.innerHTML = picks.map(productCard).join("");
  host
    .querySelectorAll("[data-add]")
    .forEach((btn) =>
      btn.addEventListener("click", () => addToCart(btn.dataset.add)),
    );
}

function renderCatalog() {
  const host = document.querySelector("[data-catalog]");
  if (!host) return;
  const q = document.querySelector("#q");
  const cat = document.querySelector("#cat");
  const categories = [
    "Todas",
    ...Array.from(new Set(window.PRODUCTS.map((p) => p.category))),
  ];
  cat.innerHTML = categories
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join("");
  function apply() {
    const term = (q.value || "").trim().toLowerCase();
    const c = cat.value;
    const list = window.PRODUCTS.filter((p) => {
      const mt =
        !term ||
        p.name.toLowerCase().includes(term) ||
        String(p.id).toLowerCase().includes(term) || // ✅ buscar por ID também
        (p.desc || "").toLowerCase().includes(term);
      const mc = c === "Todas" || p.category === c;
      return mt && mc;
    });
    host.innerHTML =
      list.map(productCard).join("") ||
      `<div class="card padded">Nenhum item encontrado.</div>`;
    host
      .querySelectorAll("[data-add]")
      .forEach((btn) =>
        btn.addEventListener("click", () => addToCart(btn.dataset.add)),
      );
  }
  q.addEventListener("input", apply);
  cat.addEventListener("change", apply);
  apply();
}

function getProduct(id) {
  return window.PRODUCTS.find((p) => p.id === id);
}

function renderCart() {
  const host = document.querySelector("[data-cart]");
  if (!host) return;
  const cart = loadCart();
  if (cart.length === 0) {
    host.innerHTML = `<div class="card padded">Seu carrinho está vazio. <a class="btn primary" href="catalogo.html" style="margin-top:10px">Ver catálogo</a></div>`;
    return;
  }
  const lines = cart
    .map((i) => {
      const p = getProduct(i.id);
      if (!p) return "";
      const total = p.price * i.qty;
      return `
    <div class="cart-item">
      <div class="cart-thumb"><img src="${productImageSrc(p)}" alt="${escapeHtml(
        p.name,
      )}" loading="lazy" onerror="this.onerror=null;this.src=PROD_PLACEHOLDER;"></div>
      <div>
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="small">Cód.: ${escapeHtml(
          p.id,
        )} • ${escapeHtml(p.category)} • ${escapeHtml(p.unit)}</div>
      </div>
      <div class="qty">
        <button class="btn" data-dec="${p.id}">-</button>
        <input class="input" style="width:60px;text-align:center" value="${
          i.qty
        }" data-qty="${p.id}" inputmode="numeric" />
        <button class="btn" data-inc="${p.id}">+</button>
      </div>
      <div class="price">${brl(total)}</div>
      <button class="btn danger" title="Remover" data-rm="${p.id}">✕</button>
    </div>`;
    })
    .join("");
  host.innerHTML = `<div class="card">${lines}</div>`;
  host.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.inc;
      const item = loadCart().find((x) => x.id === id);
      if (item) setQty(id, item.qty + 1);
      renderCart();
      renderSummary();
    }),
  );
  host.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.dec;
      const item = loadCart().find((x) => x.id === id);
      if (item) setQty(id, item.qty - 1);
      renderCart();
      renderSummary();
    }),
  );
  host.querySelectorAll("[data-rm]").forEach((b) =>
    b.addEventListener("click", () => {
      removeItem(b.dataset.rm);
      renderCart();
      renderSummary();
    }),
  );
  host.querySelectorAll("[data-qty]").forEach((inp) =>
    inp.addEventListener("change", () => {
      const id = inp.dataset.qty;
      const v = parseInt(inp.value, 10);
      setQty(id, isNaN(v) ? 1 : v);
      renderCart();
      renderSummary();
    }),
  );
}

function cartTotal(cart) {
  return cart.reduce((sum, i) => {
    const p = getProduct(i.id);
    if (!p) return sum;
    return sum + p.price * i.qty;
  }, 0);
}

function renderSummary() {
  const host = document.querySelector("[data-summary]");
  if (!host) return;
  const cart = loadCart();
  const total = cartTotal(cart);
  host.innerHTML = `
    <div class="card padded">
      <div class="row" style="justify-content:space-between;align-items:center">
        <div><strong>Total</strong><div class="small">${cart.length} item(ns)</div></div>
        <div class="price">${brl(total)}</div>
      </div>
      <button class="btn primary" style="width:100%;margin-top:10px" id="btnWhats">Enviar no WhatsApp</button>
    </div>
  `;
  const btn = document.querySelector("#btnWhats");
  btn?.addEventListener("click", () => sendWhats(cart));
}

function sendWhats(cart) {
  const total = brl(cartTotal(cart));
  const lines = cart
    .map((i) => {
      const p = getProduct(i.id);
      if (!p) return "";
      return `• ${p.name} (Cód.: ${p.id}) — ${i.qty} ${p.unit}`;
    })
    .filter(Boolean)
    .join("\n");

  const msg =
    `Olá! Gostaria de fazer um pedido na ${STORE_NAME} (${CITY}).\n\n` +
    `${lines}\n\n` +
    `Total estimado: ${total}`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function updateBadges() {
  const cart = loadCart();
  const n = cart.reduce((a, b) => a + b.qty, 0);
  document.querySelectorAll("[data-cart-badge]").forEach((el) => {
    el.textContent = n;
    el.style.display = n > 0 ? "inline-flex" : "none";
  });
}

function toast(text) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 1800);
}

function init() {
  window.PRODUCTS = window.PRODUCTS || [];
  updateBadges();
  renderFeatured();
  renderCatalog();
  renderCart();
  renderSummary();
}

document.addEventListener("DOMContentLoaded", init);
