let listingsCache = [];

function formatPrice(value, currency) {
  const formatter = new Intl.NumberFormat("en-US");
  if (currency === "LBP") {
    return `${formatter.format(value)} ل.ل`;
  }
  return `${formatter.format(value)}$`;
}

function renderListing(listing) {
  const badgeClass = listing.status === "للبيع" ? "sale" : "rent";
  const features = (listing.features || []).slice(0, 3).join(" • ");
  const whatsappNumber = window.WHATSAPP_NUMBER || "96178971332";
  const waText = `يوجد فيديو: ${listing.title}`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;
  return `
    <article class="listing-card" data-reveal>
      <div class="listing-image">
        <img src="${listing.image || "assets/img/listing-placeholder.svg"}" alt="${listing.title}">
      </div>
      <div class="listing-body">
        <div class="listing-area">${listing.area}</div>
        <span class="badge ${badgeClass}">${listing.status}</span>
        <h3>${listing.title}</h3>
        <div class="price">${formatPrice(listing.price, listing.currency)}</div>
        <div class="meta">
          <span>${listing.type}</span>
          <span>${listing.size} م²</span>
          <span>${listing.bedrooms} غرف</span>
        </div>
        <div class="meta">${features}</div>
        <a class="btn ghost whatsapp-btn" href="${waLink}" target="_blank" rel="noopener">واتساب · يوجد فيديو</a>
      </div>
    </article>
  `;
}

function applyFilters() {
  const status = document.getElementById("filter-status").value;
  const type = document.getElementById("filter-type").value;
  const area = document.getElementById("filter-area").value;
  const currency = document.getElementById("filter-currency").value;
  const minValue = Number(document.getElementById("filter-min").value || 0);
  const maxValue = Number(document.getElementById("filter-max").value || 999999999);
  const query = document.getElementById("filter-query").value.trim();

  const filtered = listingsCache.filter((listing) => {
    if (status && listing.status !== status) return false;
    if (type && listing.type !== type) return false;
    if (area && listing.area !== area) return false;
    if (currency && listing.currency !== currency) return false;
    if (listing.price < minValue || listing.price > maxValue) return false;
    if (query && !listing.title.includes(query)) return false;
    return true;
  });

  renderListings(filtered);
}

function renderListings(listings) {
  const grid = document.getElementById("listings-grid");
  const empty = document.getElementById("empty-state");
  grid.innerHTML = listings.map(renderListing).join("");
  if (!listings.length) {
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
  }
  const items = Array.from(grid.querySelectorAll("[data-reveal]"));
  items.forEach((item, index) => {
    setTimeout(() => item.classList.add("revealed"), 80 + index * 80);
  });
}

function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("status")) document.getElementById("filter-status").value = params.get("status");
  if (params.has("type")) document.getElementById("filter-type").value = params.get("type");
  if (params.has("area")) document.getElementById("filter-area").value = params.get("area");
  if (params.has("currency")) document.getElementById("filter-currency").value = params.get("currency");
  if (params.has("min")) document.getElementById("filter-min").value = params.get("min");
  if (params.has("max")) document.getElementById("filter-max").value = params.get("max");
  if (params.has("query")) document.getElementById("filter-query").value = params.get("query");

  if (params.has("budget")) {
    const [min, max] = (params.get("budget") || "").split("-");
    if (min) document.getElementById("filter-min").value = min;
    if (max) document.getElementById("filter-max").value = max;
  }
}

async function initListings() {
  try {
    const response = await fetch("data/listings.json");
    const data = await response.json();
    listingsCache = data.listings || [];
    readQueryParams();
    applyFilters();
  } catch (err) {
    renderListings([]);
  }
}

const applyButton = document.getElementById("apply-filters");
if (applyButton) {
  applyButton.addEventListener("click", applyFilters);
}

document.addEventListener("DOMContentLoaded", initListings);
