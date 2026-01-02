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
  const waText = `يوجد فيديو: ${listing.title}`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
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
        </div>
        <a class="btn ghost whatsapp-btn" href="${waLink}" target="_blank" rel="noopener">واتساب · يوجد فيديو</a>
      </div>
    </article>
  `;
}

revealOnLoad();
initQuickSearch();
loadFeaturedListings();
