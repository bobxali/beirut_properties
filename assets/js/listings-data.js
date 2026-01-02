(() => {
  async function getListings() {
    const response = await fetch("data/listings.json");
    const data = await response.json();
    return data.listings || [];
  }

  window.getListings = getListings;
})();
