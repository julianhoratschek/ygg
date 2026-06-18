# ygg

A board game browser for [Yggdrasil Café](https://yggdrasil.cafe), a board game café.

## How it works

- `ygg.py` scrapes the game list from the café's website and writes it to `ygg_db.json`
- `index.html` + `ygg.js` load the JSON and render a searchable list in the browser

## Usage

**Refresh the game database:**
```sh
python ygg.py
```

**Browse games:**  
Open `index.html` in a browser (requires a local server to fetch the JSON, e.g. `python -m http.server`).

## Search

- Type a name to filter by game name
- Use `p: <range>` to filter by player count — e.g. `p: 2-4`, `p: 4`, `p: 6+`

## Files

| File | Purpose |
|------|---------|
| `ygg.py` | Scraper — fetches and parses the café's game table |
| `ygg_db.json` | Cached game data |
| `ygg.ts` | TypeScript source for the frontend |
| `ygg.js` | Compiled JS (served to the browser) |
| `index.html` | Frontend entry point |
| `style.css` | Styles |
