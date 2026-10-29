# GoForge

A focused Go editor experience built with React and Vite. The current shell includes:

- VS Code-inspired workspace layout with explorer, tabs, breadcrumbs and status bar
- Functional Go source editor with indentation, cursor position and save state
- Light/dark theme switcher
- Run action with Go Playground compiler API endpoints and readable terminal output

## Development

```bash
npm install
npm run dev
```

Build for production with `npm run build`.

The editor tries the current `go.dev` Playground endpoint first and falls back to the legacy `play.golang.org/compile` endpoint. Browser network policy or CORS restrictions may require a small backend proxy for production deployments.
