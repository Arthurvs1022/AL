const WA_NUMBER = "5581984195038";
const STORE_NAME = "AL ELÉTRICA, HIDRÁULICA & PARAFUSO";
const CITY = "TAMANDARÉ-PE";

function brl(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = loadCart();
  const count = cart.reduce((a, i) => a + i.qty, 0);
  document
    .querySelectorAll("[data-cart-badge]")
    .forEach((el) => (el.textContent = count));
}
function getProduct(id) {
  return (window.PRODUCTS || []).find((p) => p.id === id);
}
function toast(msg) {
  const el = document.createElement("div");
  el.className = "notice";
  el.style.cssText =
    "position:fixed;left:18px;right:18px;bottom:18px;max-width:520px;margin:0 auto;z-index:999";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity .25s";
  }, 1800);
  setTimeout(() => el.remove(), 2200);
}
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addToCart(id) {
  const cart = loadCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  toast("Adicionado ao carrinho ✅");
}
function setQty(id, qty) {
  let cart = loadCart();
  cart = cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
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
    <div class="meta">
      <span class="badge">${escapeHtml(p.category)}</span>
      <span class="price">${brl(p.price)}</span>
    </div>
    <h3>${escapeHtml(p.name)}</h3>
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
  const featured = (window.PRODUCTS || []).slice(0, 8);
  host.innerHTML = featured.map(productCard).join("");
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
      <div><div class="name">${escapeHtml(p.name)}</div><div class="small">${escapeHtml(p.category)} • ${escapeHtml(p.unit)}</div></div>
      <div class="qty">
        <button class="btn" data-dec="${p.id}">-</button>
        <input class="input" style="width:60px;text-align:center" value="${i.qty}" data-qty="${p.id}" inputmode="numeric" />
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
      if (Number.isFinite(v) && v > 0) setQty(id, v);
      renderCart();
      renderSummary();
    }),
  );
}

function onlyDigits(s) {
  return (s || "").replace(/\D+/g, "");
}
function collectCheckoutData() {
  const nome = document.querySelector("#nome")?.value?.trim() || "";
  const tel = onlyDigits(document.querySelector("#tel")?.value || "");
  const pagamento = document.querySelector("#pagamento")?.value || "Pix";
  const obs = document.querySelector("#obs")?.value?.trim() || "";
  const retirada = document.querySelector("#retirada")?.checked || false;
  const bairro = document.querySelector("#bairro")?.value || "Centro";
  const rua = document.querySelector("#rua")?.value?.trim() || "";
  const numero = document.querySelector("#numero")?.value?.trim() || "";
  const complemento =
    document.querySelector("#complemento")?.value?.trim() || "";
  return {
    nome,
    tel,
    pagamento,
    obs,
    retirada,
    bairro,
    rua,
    numero,
    complemento,
  };
}
function buildWhatsAppMessage(data, cart, subtotal, fee, total) {
  const lines = [];
  lines.push(
    `Olá! Quero fazer um pedido no *${STORE_NAME}* (${CITY}).`,
    "",
    "*Itens:*",
  );
  cart.forEach((i) => {
    const p = getProduct(i.id);
    if (!p) return;
    lines.push(`- ${i.qty}x ${p.name} (${p.unit}) — ${brl(p.price * i.qty)}`);
  });
  lines.push(
    "",
    `Subtotal: *${brl(subtotal)}*`,
    `Entrega: *${brl(fee)}*`,
    `Total: *${brl(total)}*`,
    "",
    "*Dados:*",
    `Nome: ${data.nome || "-"}`,
    `Telefone: ${data.tel || "-"}`,
    `Pagamento: ${data.pagamento}`,
    `Retirar na loja: ${data.retirada ? "Sim" : "Não"}`,
  );
  if (!data.retirada) {
    lines.push(
      `Bairro: ${data.bairro}`,
      `Rua: ${data.rua || "-"}`,
      `Número: ${data.numero || "-"}`,
    );
    if (data.complemento) lines.push(`Complemento: ${data.complemento}`);
  }
  if (data.obs) lines.push("", `Obs.: ${data.obs}`);
  lines.push("", "Pode confirmar disponibilidade e prazo de entrega? 🙏");
  return lines.join("\n");
}

function renderSummary() {
  const host = document.querySelector("[data-summary]");
  if (!host) return;
  const cart = loadCart();
  const subtotal = cart.reduce((a, i) => {
    const p = getProduct(i.id);
    return a + (p ? p.price * i.qty : 0);
  }, 0);
  const bairroSel = document.querySelector("#bairro");
  const retirada = document.querySelector("#retirada");
  const feeTable = window.DELIVERY_FEES || {};
  if (bairroSel && bairroSel.options.length === 0)
    bairroSel.innerHTML = Object.keys(feeTable)
      .map(
        (b) =>
          `<option value="${escapeHtml(b)}">${escapeHtml(b)} — ${brl(feeTable[b])}</option>`,
      )
      .join("");
  const fee =
    retirada && retirada.checked ? 0 : (feeTable[bairroSel?.value] ?? 0);
  const total = subtotal + fee;
  host.innerHTML = `
    <div class="card padded totals">
      <div class="line"><span>Subtotal</span><span>${brl(subtotal)}</span></div>
      <div class="line"><span>Entrega</span><span>${brl(fee)}</span></div>
      <div class="line grand"><span>Total</span><span>${brl(total)}</span></div>
      <button class="btn success" id="btnWhats">Finalizar no WhatsApp</button>
      <div class="small">Você confirma tudo no WhatsApp.</div>
    </div>`;
  document.querySelector("#btnWhats")?.addEventListener("click", () => {
    const data = collectCheckoutData();
    const msg = buildWhatsAppMessage(data, cart, subtotal, fee, total);
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  });
}

function masks() {
  const tel = document.querySelector("#tel");
  if (tel)
    tel.addEventListener("input", () => {
      let v = tel.value.replace(/\D/g, "").slice(0, 11);
      if (v.length <= 10)
        v = v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
      else
        v = v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
      tel.value = v;
    });
}

function init() {
  updateCartBadge();
  renderFeatured();
  renderCatalog();
  renderCart();
  renderSummary();
  masks();
  document.querySelector("#bairro")?.addEventListener("change", renderSummary);
  document.querySelector("#retirada")?.addEventListener("change", () => {
    const disabled = document.querySelector("#retirada").checked;
    document
      .querySelectorAll("[data-address]")
      .forEach((el) => (el.style.opacity = disabled ? ".55" : "1"));
    document
      .querySelectorAll("[data-address] input, [data-address] select")
      .forEach((el) => (el.disabled = disabled));
    renderSummary();
  });
}
document.addEventListener("DOMContentLoaded", init);

window.PRODUCTS = window.PRODUCTS.map(p => ({
  ...p,
  category: CATEGORY_MAP[p.category] || "Outros"
}));