(() => {
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  function revealOnLoad() {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    items.forEach((item, index) => {
      setTimeout(() => item.classList.add("revealed"), 120 + index * 120);
    });
  }

  function initQuickSearch() {
    const form = document.getElementById("quick-search");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of data.entries()) {
        if (value) params.append(key, value);
      }
      const target = params.toString()
        ? `listings.html?${params.toString()}`
        : "listings.html";
      window.location.href = target;
    });
  }

  function getListingImage(listing) {
    if (Array.isArray(listing.images) && listing.images.length) {
      return listing.images[0];
    }
    return listing.image || "assets/img/listing-placeholder.svg";
  }

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

  async function loadFeaturedListings() {
    const container = document.getElementById("featured-listings");
    if (!container) return;
    try {
      if (typeof window.getListings !== "function") {
        throw new Error("getListings is not available");
      }
      const allListings = await window.getListings();
      const listings = allListings.filter(item => item.featured);
      const display = listings.length ? listings.slice(0, 3) : allListings.slice(0, 3);
      container.innerHTML = display.map(renderCard).join("");
    } catch (err) {
      container.innerHTML = "<p class=\"empty\" style=\"display:block\">تعذّر تحميل العقارات حالياً.</p>";
    }
  }

  function formatPrice(value, currency) {
    const formatter = new Intl.NumberFormat("en-US");
    if (currency === "LBP") {
      return `${formatter.format(value)} ل.ل`;
    }
    return `${formatter.format(value)}$`;
  }

  const WHATSAPP_NUMBER = "96178971332";

  function renderCard(listing) {
    const badgeClass = listing.status === "للبيع" ? "sale" : "rent";
    const details = getListingDetails(listing);
    const extras = getListingExtras(listing);
    const waText = `يوجد فيديو: ${listing.title}`;
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    const extraMeta = extras.length ? `<div class=\"meta\">${extras.join(" • ")}</div>` : "";
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

  revealOnLoad();
  initQuickSearch();
  loadFeaturedListings();
})();
