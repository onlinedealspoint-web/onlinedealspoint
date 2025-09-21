// app.js
const BRAND_LOGO_SLUG = "odp";           // images/logo/odp.*
const UPI_ID = "dashb208@pingpay";
const UPI_NAME = "Online Deals Point";
const WHATSAPP_NUMBER = "918293613888";  // set your number, e.g., 919876543210

// Currency
const formatINR = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Resolve /images/... by trying webp/png/jpg/jpeg/svg automatically
const EXT_ORDER = ["webp","png","jpg","jpeg","svg"];
async function resolveImage(basePath) {
  for (const ext of EXT_ORDER) {
    const url = `${basePath}.${ext}`;
    const ok = await new Promise(res => {
      const i = new Image();
      i.onload = () => res(true);
      i.onerror = () => res(false);
      i.src = url;
    });
    if (ok) return url;
  }
  return null;
}
async function setImgSrc(el, basePath, alt="") {
  const url = await resolveImage(basePath);
  if (url) { el.src = url; el.alt = alt; }
}
function setLogoFromDomain(imgEl, domain, fallbackBase){
  imgEl.crossOrigin = "anonymous";
  imgEl.src = `https://logo.clearbit.com/${domain}?size=256`;
  imgEl.alt = "logo";
  imgEl.onerror = () => setImgSrc(imgEl, `images/logo/${fallbackBase}`, "logo");
}

// Cart
const CART_KEY = "odp-cart";
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function setCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartCount(); }
function updateCartCount(){
  const c = getCart().reduce((s,i)=>s+(i.qty||1),0);
  document.querySelectorAll("#cartCount").forEach(n => n && (n.textContent = c));
}
function addToCart(item){
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === item.id && i.variant === item.variant);
  if (idx >= 0) cart[idx].qty += item.qty || 1;
  else cart.push({ ...item, qty: item.qty || 1 });
  setCart(cart);
}
function removeFromCart(id, variant){
  setCart(getCart().filter(i => !(i.id === id && i.variant === variant)));
}
function setBuyNowItem(item){ localStorage.setItem("odp-buynow", JSON.stringify(item)); }
function getBuyNowItem(){ try { return JSON.parse(localStorage.getItem("odp-buynow")); } catch { return null; } }
function clearBuyNowItem(){ localStorage.removeItem("odp-buynow"); }

// UPI
function buildUpiLink(amount, note){
  const params = new URLSearchParams({ pa: UPI_ID, pn: UPI_NAME, am: Number(amount).toFixed(2), cu:"INR", tn: note || "ODP Order" });
  return `upi://pay?${params.toString()}`;
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  // Brand logo in header/footer
  document.querySelectorAll("#brandLogo").forEach(img => setImgSrc(img, `images/logo/${BRAND_LOGO_SLUG}`, "ODP logo"));
  // Banner
  if (document.body.dataset.page === "home") setImgSrc(document.getElementById("heroImage"), "images/banner.png", "Banner");
  // Year
  document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());
});