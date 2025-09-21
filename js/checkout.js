// checkout.js
function getItemsForCheckout(){
  const bn = getBuyNowItem();
  if (bn) return [bn];
  return getCart();
}
function orderSummaryRow(it){
  const variantLabel = it.variant.replace("m"," month").replace("y"," year");
  const row = document.createElement("div");
  row.className = "summary__row";
  row.innerHTML = `
    <div>${it.name} <span class="muted">(${variantLabel}) × ${it.qty}</span></div>
    <div><strong>${formatINR(it.price * it.qty)}</strong></div>`;
  return row;
}
function buildWaMessage(items, total){
  const names = Array.from(new Set(items.map(i => i.name)));
  let phrase = names.length === 1 ? `${names[0]} single` : names.length === 2 ? `${names[0]} and ${names[1]}` : names.slice(0,-1).join(", ") + " and " + names.slice(-1);
  return [
    "Hi ODP,",
    "I have paid for:",
    ...items.map(i => `• ${i.name} (${i.variant}) × ${i.qty} = ${formatINR(i.price*i.qty)}`),
    `Total: ${formatINR(total)}`,
    `Service: ${phrase}`,
    "Please verify and activate."
  ].join("\n");
}
function renderCheckout(){
  const items = getItemsForCheckout();
  const summary = document.getElementById("orderSummary");
  const totalEl = document.getElementById("orderTotal");
  const upiText = document.getElementById("upiIdText");
  const openUPILink = document.getElementById("openUPILink");
  const qrEl = document.getElementById("qrcode");

  if(!items.length){ summary.innerHTML = `<div class="muted">No items to checkout. Please add products first.</div>`; return; }

  summary.innerHTML = "";
  let total = 0;
  items.forEach(i => { total += i.price * i.qty; summary.appendChild(orderSummaryRow(i)); });
  totalEl.textContent = formatINR(total);

  upiText.textContent = UPI_ID;
  const note = `ODP Order ${Date.now()}`;
  const upiLink = buildUpiLink(total, note);
  openUPILink.href = upiLink;

  qrEl.innerHTML = "";
  const qr = new QRCode(qrEl, { text: upiLink, width: 256, height: 256, correctLevel: QRCode.CorrectLevel.M });

  document.getElementById("downloadQR").addEventListener("click", () => {
    const canvas = qrEl.querySelector("canvas");
    const img = qrEl.querySelector("img");
    let dataURL = canvas ? canvas.toDataURL("image/png") : img ? img.src : "";
    const a = document.createElement("a"); a.href = dataURL; a.download = `ODP-UPI-QR-${total}.png`; a.click();
  });
  document.getElementById("copyUpiBtn").addEventListener("click", async () => { await navigator.clipboard.writeText(UPI_ID); alert("UPI ID copied"); });

  const waMsg = encodeURIComponent(buildWaMessage(items, total));
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;
  const waBtn = document.getElementById("waBtn"); waBtn.href = waUrl; waBtn.target = "_blank"; waBtn.rel = "noopener";

  clearBuyNowItem(); // keep cart intact
}
document.addEventListener("DOMContentLoaded", renderCheckout);