let listingsCache = [];
const AMENITY_LABELS = [
  ["water_state", "مياه دولة"],
  ["water_well", "بئر ارتوازي"],
  ["electricity_state", "كهرباء دولة"],
  ["generator", "مولد"],
  ["solar", "طاقة شمسية"],
  ["elevator", "مصعد"],
  ["parking", "موقف سيارة"],
  ["storage", "مستودع"],
  ["sea_view", "إطلالة بحر"],
  ["mountain_view", "إطلالة جبل"],
  ["security", "حراسة"],
  ["cameras", "كاميرات"],
  ["ac", "تكييف"],
  ["heating", "تدفئة"]
];

function getListingImage(listing) {
  if (Array.isArray(listing.images) && listing.images.length) {
    return listing.images[0];
  }
  return listing.image || "assets/img/listing-placeholder.svg";
}

function getAmenityLabels(listing) {
  const hasWaterSource = Boolean(listing.water_source);
  return AMENITY_LABELS.filter(([key]) => {
    if (hasWaterSource && (key === "water_state" || key === "water_well")) {
      return false;
    }
    return Boolean(listing[key]);
  }).map(([, label]) => label);
}

function getListingFeatures(listing) {
  const base = Array.isArray(listing.features) ? listing.features : [];
  const amenities = getAmenityLabels(listing);
  return amenities.concat(base);
}

function getListingDetails(listing) {
  const details = [];
  if (listing.size) details.push(`المساحة: ${listing.size} م²`);
  if (listing.legal_status) details.push(`الوضع القانوني: ${listing.legal_status}`);
  if (listing.floor !== undefined && listing.floor !== null && listing.floor !== "") {
    details.push(`الطابق: ${listing.floor}`);
  }
  if (listing.bedrooms !== undefined && listing.bedrooms !== null && listing.bedrooms !== "") {
    details.push(`الغرف: ${listing.bedrooms}`);
  }
  if (listing.bathrooms !== undefined && listing.bathrooms !== null && listing.bathrooms !== "") {
    details.push(`الحمامات: ${listing.bathrooms}`);
  }
  if (listing.water_source) details.push(`المياه: ${listing.water_source}`);
  if (listing.view_type) details.push(`الإطلالة: ${listing.view_type}`);
  if (listing.building_condition) details.push(`حالة البناء: ${listing.building_condition}`);
  if (listing.balconies !== undefined && listing.balconies !== null && listing.balconies !== "") {
    details.push(`الشرفات: ${listing.balconies}`);
  }
  return details;
}

function getListingExtras(listing) {
  const extras = [];
  if (listing.type) extras.push(`النوع: ${listing.type}`);
  return extras.concat(getListingFeatures(listing));
}

function formatPrice(value, currency) {
  const formatter = new Intl.NumberFormat("en-US");
  if (currency === "LBP") {
    return `${formatter.format(value)} ل.ل`;
  }
  return `${formatter.format(value)}$`;
}

function renderListing(listing) {
  const badgeClass = listing.status === "للبيع" ? "sale" : "rent";
  const details = getListingDetails(listing);
  const extras = getListingExtras(listing);
  const whatsappNumber = window.WHATSAPP_NUMBER || "96178971332";
  const waText = `يوجد فيديو: ${listing.title}`;
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;
  const extraMeta = extras.length ? `<div class="meta">${extras.join(" • ")}</div>` : "";
  return `
    <article class="listing-card" data-reveal>
      <div class="listing-image">
        <img src="${getListingImage(listing)}" alt="${listing.title}">
      </div>
      <div class="listing-body">
        <div class="listing-area">${listing.area}</div>
        <span class="badge ${badgeClass}">${listing.status}</span>
        <h3>${listing.title}</h3>
        <div class="price">${formatPrice(listing.price, listing.currency)}</div>
        <div class="meta">${details.join(" • ")}</div>
        ${extraMeta}
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
    if (typeof window.getListings !== "function") {
      throw new Error("getListings is not available");
    }
    listingsCache = await window.getListings();
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
