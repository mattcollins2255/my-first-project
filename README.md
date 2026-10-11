# Learning Agentic AI: To-Do List

A small to-do list web app for tracking what you're learning about coding with AI agents.
Plain HTML, CSS, and JavaScript, with no dependencies.

## Run it locally

```
npm start
```

Then open http://localhost:3000.

## Run the tests

```
npm test
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Look and feel (supports light and dark mode) |
| `todos.js` | To-do logic (add, toggle, delete, filter). No browser code, so it's easy to test |
| `app.js` | Connects `todos.js` to the page and saves to `localStorage` |
| `todos.test.js` | Tests for `todos.js`, run with Node's built-in test runner |
| `server.js` | Tiny local web server for development (not needed when deployed) |

## Deploy

The app is just static files, so any static host works. Some options:

- **GitHub Pages:** push this folder to a GitHub repo, then go to Settings → Pages and choose the `main` branch.
- **Netlify Drop:** drag this folder onto https://app.netlify.com/drop.
- **Cloudflare Pages:** connect the repo; no build command needed.

Note: your list is saved in your browser's `localStorage`, so it's per-browser and per-device.
