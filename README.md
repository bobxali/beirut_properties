# Beirut & Suburbs Properties

Static real-estate website (HTML/CSS/JS) with listings loaded from `data/listings.json` and images stored in `assets/img/`.

## Local preview
- Open `index.html` directly for a quick look.
- For JSON loading, use a simple local server:
  - `python -m http.server 8000`
  - Then open `http://localhost:8000/`

## GitHub Pages deploy
1. GitHub repo → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`
4. **Folder:** `/ (root)`
5. Save

Your live site URL:
`https://bobxali.github.io/beirut_properties/`

## Listings data
- File: `data/listings.json`
- Images: `assets/img/` or `assets/img/uploads/`
- Each listing can include up to 3 images (by referencing them in the JSON).

## Logo
Replace `assets/img/logo.jpg` with your logo (same filename).
