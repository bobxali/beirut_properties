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
    const response = await fetch("data/listings.json");
    const data = await response.json();
    const listings = (data.listings || []).filter(item => item.featured);
    const display = listings.length ? listings.slice(0, 3) : (data.listings || []).slice(0, 3);
    container.innerHTML = display.map(renderCard).join("");
  } catch (err) {
    container.innerHTML = "<p class=\"empty\" style=\"display:block\">تعذّر تحميل العقارات حالياً.</p>";
  }
}

function formatPrice(value, currency) {
  const formatter = new Intl.NumberFormat("ar-LB");
  const label = currency === "LBP" ? "ل.ل" : "$";
  return `${formatter.format(value)} ${label}`;
}

function renderCard(listing) {
  const badgeClass = listing.status === "للبيع" ? "sale" : "rent";
  return `
    <article class="listing-card" data-reveal>
      <div class="listing-image">
        <img src="${listing.image || "assets/img/listing-placeholder.svg"}" alt="${listing.title}">
      </div>
      <div class="listing-body">
        <span class="badge ${badgeClass}">${listing.status}</span>
        <h3>${listing.title}</h3>
        <div class="price">${formatPrice(listing.price, listing.currency)}</div>
        <div class="meta">
          <span>${listing.area}</span>
          <span>${listing.type}</span>
          <span>${listing.size} م²</span>
        </div>
      </div>
    </article>
  `;
}

revealOnLoad();
initQuickSearch();
loadFeaturedListings();
