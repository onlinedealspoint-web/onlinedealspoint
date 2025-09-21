// cart.js
function row(item){
  const total = item.price * item.qty;
  const variantLabel = item.variant.replace("m"," month").replace("y"," year");
  const el = document.createElement("div");
  el.className = "cartitem";
  el.innerHTML = `
    <div class="cartitem__img"><img alt="${item.name} logo" /></div>
    <div class="cartitem__meta">
      <div><strong>${item.name}</strong> <span class="muted">(${variantLabel})</span></div>
      <div class="muted">${formatINR(item.price)} each</div>
      <button class="removebtn">Remove</button>
    </div>
    <div class="cartitem__qty">
      <button class="qtybtn" data-act="dec">-</button>
      <strong>${item.qty}</strong>
      <button class="qtybtn" data-act="inc">+</button>
      <div style="width:80px;text-align:right"><strong>${formatINR(total)}</strong></div>
    </div>`;
  setLogoFromDomain(el.querySelector("img"), item.domain || (item.logoSlug ? `${item.logoSlug}.com` : ""), item.logoSlug || "logo");

  el.querySelectorAll(".qtybtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const it = cart.find(i => i.id === item.id && i.variant === item.variant);
      if (!it) return;
      if (btn.dataset.act === "inc") it.qty += 1;
      else it.qty = Math.max(1, it.qty - 1);
      setCart(cart); renderCart();
    });
  });
  el.querySelector(".removebtn").addEventListener("click", () => { removeFromCart(item.id, item.variant); renderCart(); });
  return el;
}
function renderCart(){
  const list = document.getElementById("cartItems");
  const empty = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");
  const items = getCart();

  list.innerHTML = "";
  if(!items.length){
    empty.classList.remove("hidden");
    totalEl.textContent = formatINR(0);
    document.getElementById("checkoutBtn").classList.add("disabled");
    document.getElementById("checkoutBtn").style.pointerEvents = "none";
    return;
  }
  document.getElementById("checkoutBtn").classList.remove("disabled");
  document.getElementById("checkoutBtn").style.pointerEvents = "auto";
  empty.classList.add("hidden");

  let total = 0;
  items.forEach(i => { total += i.price * i.qty; list.appendChild(row(i)); });
  totalEl.textContent = formatINR(total);
}
document.addEventListener("DOMContentLoaded", renderCart);