(() => {
  let listingsCache = [];
  let currentListings = [];
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

  function getListingImages(listing) {
    if (Array.isArray(listing.images) && listing.images.length) {
      return listing.images;
    }
    if (listing.image) {
      return [listing.image];
    }
    return ["assets/img/listing-placeholder.svg"];
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

  function renderListing(listing, index) {
    const badgeClass = listing.status === "للبيع" ? "sale" : "rent";
    const details = getListingDetails(listing);
    const extras = getListingExtras(listing);
    const whatsappNumber = window.WHATSAPP_NUMBER || "96178971332";
    const waText = `يوجد فيديو: ${listing.title}`;
    const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`;
    const extraMeta = extras.length ? `<div class="meta">${extras.join(" • ")}</div>` : "";
    const images = getListingImages(listing);
    const hasMultipleImages = images.length > 1;
    const controls = hasMultipleImages
      ? `
        <div class="image-controls">
          <button type="button" data-gallery-action="prev">‹</button>
          <span class="image-count">1 / ${images.length}</span>
          <button type="button" data-gallery-action="next">›</button>
        </div>
      `
      : "";
    return `
      <article class="listing-card" data-reveal data-index="${index}" data-image-index="0" data-image-total="${images.length}">
        <div class="listing-image">
          <img src="${images[0]}" alt="${listing.title}">
          ${controls}
        </div>
        <div class="listing-body">
          <div class="listing-head">
            <div class="listing-area">${listing.area}</div>
            <span class="badge ${badgeClass}">${listing.status}</span>
          </div>
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
    const queryText = query.toLowerCase();

    const filtered = listingsCache.filter((listing) => {
      if (status && listing.status !== status) return false;
      if (type && listing.type !== type) return false;
      if (area && listing.area !== area) return false;
      if (currency && listing.currency !== currency) return false;
      if (listing.price < minValue || listing.price > maxValue) return false;
      if (queryText) {
        const titleText = (listing.title || "").toLowerCase();
        const areaText = (listing.area || "").toLowerCase();
        if (!titleText.includes(queryText) && !areaText.includes(queryText)) return false;
      }
      return true;
    });

    renderListings(filtered);
  }

  function renderListings(listings) {
    const grid = document.getElementById("listings-grid");
    const empty = document.getElementById("empty-state");
    currentListings = listings;
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

  const galleryModal = document.getElementById("gallery-modal");
  const galleryImage = document.getElementById("gallery-image");
  const galleryClose = document.getElementById("gallery-close");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");
  const galleryCount = document.getElementById("gallery-count");
  let galleryImages = [];
  let galleryIndex = 0;

  function updateGallery() {
    if (!galleryModal || !galleryImage) return;
    galleryImage.src = galleryImages[galleryIndex];
    galleryCount.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
    galleryPrev.disabled = galleryIndex === 0;
    galleryNext.disabled = galleryIndex === galleryImages.length - 1;
  }

  function openGallery(listingIndex) {
    if (!galleryModal) return;
    const listing = currentListings[listingIndex];
    if (!listing) return;
    galleryImages = getListingImages(listing);
    galleryIndex = 0;
    updateGallery();
    galleryModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeGallery() {
    if (!galleryModal) return;
    galleryModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  const applyButton = document.getElementById("apply-filters");
  if (applyButton) {
    applyButton.addEventListener("click", applyFilters);
  }

  const grid = document.getElementById("listings-grid");
  if (grid) {
    grid.addEventListener("click", (event) => {
      if (!galleryModal) return;
      const card = event.target.closest(".listing-card");
      const imageWrap = event.target.closest(".listing-image");
      const actionButton = event.target.closest("[data-gallery-action]");
      if (!card || !imageWrap) return;
      if (actionButton) {
        event.stopPropagation();
        const action = actionButton.getAttribute("data-gallery-action");
        const index = Number(card.getAttribute("data-index"));
        if (Number.isNaN(index)) return;
        const listing = currentListings[index];
        if (!listing) return;
        const images = getListingImages(listing);
        const total = images.length;
        let current = Number(card.getAttribute("data-image-index") || 0);
        if (action === "next") {
          current = (current + 1) % total;
        } else {
          current = (current - 1 + total) % total;
        }
        const img = card.querySelector(".listing-image img");
        const count = card.querySelector(".image-count");
        if (img) img.src = images[current];
        if (count) count.textContent = `${current + 1} / ${total}`;
        card.setAttribute("data-image-index", String(current));
        return;
      }
      const index = Number(card.getAttribute("data-index"));
      if (Number.isNaN(index)) return;
      openGallery(index);
    });
  }

  if (galleryClose) {
    galleryClose.addEventListener("click", closeGallery);
  }
  if (galleryModal) {
    galleryModal.addEventListener("click", (event) => {
      if (event.target === galleryModal) closeGallery();
    });
  }
  if (galleryPrev) {
    galleryPrev.addEventListener("click", () => {
      if (galleryIndex > 0) {
        galleryIndex -= 1;
        updateGallery();
      }
    });
  }
  if (galleryNext) {
    galleryNext.addEventListener("click", () => {
      if (galleryIndex < galleryImages.length - 1) {
        galleryIndex += 1;
        updateGallery();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initListings);
})();
