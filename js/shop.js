// shop.js — mobile-optimized search + robust View click handling

// Cards (hard-coded in HTML)
const cards = Array.from(document.querySelectorAll(".card"));
const grid = document.getElementById("productsGrid");
const noResults = document.getElementById("noResults");

// Category thumbnails from your images folder
setImgSrc(document.getElementById("tabAll"), "images/categories/all", "All");
setImgSrc(document.getElementById("tabOtt"), "images/categories/ott", "OTT");
setImgSrc(document.getElementById("tabSoft"), "images/categories/softwares", "Softwares");

// Helpers
const catLabels = { all: "All", ott: "OTT", softwares: "Softwares" };
const activeCat = () => document.querySelector(".tab.active")?.dataset.cat || "all";
const normalize = s => (s || "").toLowerCase().normalize("NFKD").replace(/[^\w]+/g, " ").trim();

// Build a tiny index to search quickly
const INDEX = cards.map(card => ({
  card,
  name: normalize(card.dataset.name),
  cat: card.dataset.category
}));

// Search controls
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearSearch");

function debounce(fn, delay=180){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),delay); }; }

function updatePlaceholder(){
  searchInput.placeholder = `Search in ${catLabels[activeCat()]}`;
}

function applyFilter(scrollTop=false){
  const cat = activeCat();
  const q = normalize(searchInput.value);
  let shown = 0;

  INDEX.forEach(({card, name, cat: c})=>{
    const inCat = cat === "all" || c === cat;
    const match = !q || name.includes(q);
    const visible = inCat && match;
    card.hidden = !visible;
    if (visible) shown++;
  });

  if (shown === 0){
    const label = catLabels[cat];
    const typed = searchInput.value.trim();
    noResults.textContent = typed ? `No products found for "${typed}" in ${label}` : `No products found in ${label}`;
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
  }
  if (scrollTop) grid.scrollIntoView({ behavior:"smooth", block:"start" });
}

// Category tab clicks
document.querySelectorAll(".tab").forEach(t=>{
  t.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active");
    updatePlaceholder();
    applyFilter(true);
  });
});

// Search input: debounced
const debouncedFilter = debounce(()=>applyFilter(false), 140);
searchInput.addEventListener("input", debouncedFilter);

// Submit triggers filter (nice for low-end devices)
searchForm.addEventListener("submit", e => { e.preventDefault(); applyFilter(true); });

// Clear
clearBtn.addEventListener("click", ()=>{
  if (searchInput.value){
    searchInput.value = "";
    applyFilter(true);
    searchInput.focus();
  }
});
// Esc clears
searchInput.addEventListener("keydown", e => { if (e.key === "Escape"){ e.preventDefault(); clearBtn.click(); } });

// Robust View handling (delegated)
grid.addEventListener("click", e => {
  const viewBtn = e.target.closest(".card__view");
  const card = viewBtn ? viewBtn.closest(".card") : e.target.closest(".card");
  if (card) openCard(card);
});

// Modal logic
const modal = document.getElementById("productModal");
const pmImg = document.getElementById("pmImg");
const pmTitle = document.getElementById("pmTitle");
const pmBadge = document.getElementById("pmBadge");
const pmVariants = document.getElementById("pmVariants");
const pmActions = document.getElementById("pmActions");

document.getElementById("pmClose").addEventListener("click", ()=> modal.classList.add("hidden"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

function openCard(card){
  const isSoftware = card.dataset.software === "true";
  const name = card.dataset.name;
  const id = card.dataset.id;
  const domain = card.dataset.domain;

  pmTitle.textContent = name;
  pmBadge.textContent = isSoftware ? "Software" : "OTT";
  setLogoFromDomain(pmImg, domain, id);

  if (isSoftware){
    pmVariants.innerHTML = `
      <div class="variant">
        <div>
          <strong>To buy software, please contact us on WhatsApp.</strong>
          <div class="muted" style="margin-top:.2rem">We’ll share pricing and steps instantly.</div>
        </div>
      </div>`;
    const msg = encodeURIComponent(`Hi ODP, I want to buy ${name}. Please help me with details.`);
    pmActions.innerHTML = `<a class="btn btn--wa" href="https://wa.me/${WHATSAPP_NUMBER}?text=${msg}" target="_blank" rel="noopener">💬 Chat with us on WhatsApp</a>`;
  } else {
    const v1m = card.dataset.v1m || "";
    const v6m = card.dataset.v6m || "";
    const v1y = card.dataset.v1y || "";
    const row = (lbl, price) => `
      <label class="variant ${price ? "" : "disabled"}">
        <div style="display:flex;align-items:center;gap:.6rem">
          <input type="radio" name="pmVariant" value="${lbl}" ${price ? "" : "disabled"}>
          <strong>${lbl.replace("m"," month").replace("y"," year")}</strong>
        </div>
        <span>${price ? formatINR(price) : "-"}</span>
      </label>`;

    pmVariants.innerHTML = row("1m", v1m) + row("6m", v6m) + row("1y", v1y);
    const first = ["1m","6m","1y"].find(k => card.dataset["v"+k]);
    if (first){ const r = pmVariants.querySelector(`input[value="${first}"]`); if (r) r.checked = true; }

    pmActions.innerHTML = `
      <button class="btn btn--ghost" id="addToCartBtn">Add to Cart</button>
      <button class="btn btn--primary" id="buyNowBtn">Buy Now</button>`;

    function selected(){
      const r = pmVariants.querySelector('input[name="pmVariant"]:checked');
      if (!r) return null;
      return { key: r.value, price: Number(card.dataset["v"+r.value]) };
    }
    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const sel = selected(); if(!sel){ alert("Please select a duration"); return; }
      addToCart({ id, name, variant: sel.key, price: sel.price, domain, logoSlug: id, category:"ott", qty:1 });
      const btn = document.getElementById("addToCartBtn");
      btn.textContent = "Go to Cart"; btn.classList.remove("btn--ghost"); btn.classList.add("btn--primary");
      btn.onclick = () => location.href = "cart.html";
    });
    document.getElementById("buyNowBtn").addEventListener("click", () => {
      const sel = selected(); if(!sel){ alert("Please select a duration"); return; }
      setBuyNowItem({ id, name, variant: sel.key, price: sel.price, domain, logoSlug: id, category:"ott", qty:1 });
      location.href = "checkout.html";
    });
  }
  modal.classList.remove("hidden");
}

// Initial
updatePlaceholder();
applyFilter();