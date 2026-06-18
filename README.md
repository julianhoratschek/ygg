# ygg

A simple web app to browse the game library of [Yggdrasil Café](https://yggdrasil.cafe), a board game café.

## Features

- Game list fetched live from the café's website
- Filter by name
- Filter by player count using `p: <range>`
- Responsive layout for mobile and desktop

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.14+, Flask |
| Frontend | TypeScript → vanilla JS |
| Server | Gunicorn (production) |

## Setup

```sh
uv sync
uv run flask run
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

**Production:**

```sh
uv run gunicorn app:app
```

## Search syntax

| Query | Result |
|-------|--------|
| `catan` | Games with "catan" in the name |
| `p: 4` | Games that support exactly 4 players |
| `p: 2-4` | Games supporting a 2–4 player range |
| `p: 6+` | Games for 6 or more players |
| `catan p: 2-4` | Name and player count combined |

## Project structure

```
app.py                  Flask server — scrapes /spieleauswahl, serves /api/data
templates/index.html    Frontend entry point (Jinja2)
static/js/ygg.ts        TypeScript source
static/js/ygg.js        Compiled JS (served to browser)
static/css/style.css    Styles
```
