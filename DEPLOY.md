# Static Widget Deployment

This is a fully static React application with all configuration baked in at build time. **No server required!**

## Build

```bash
yarn install
yarn build
```

The output is in `dist/` directory.

## Configuration

All configuration is injected at build time from `.env` file:

- `VITE_WIDGET_HOST` - Where the widget is hosted and the base URL for QR code generation
- `VITE_MS_CTRL_CALLBACK_URL` - Media server control callback URL
- `VITE_CTRL_CALLBACK_URL` - Control callback URL

## Deployment

The `dist/` directory contains a fully static SPA. Deploy it to:

- **S3 + CloudFront**
- **Netlify / Vercel**
- **GitHub Pages**
- **Any CDN or static host**

### Deployment Requirements

1. Serve `index.html` for all routes (SPA fallback)
2. Serve static assets from `/assets/*`
3. HTTPS recommended

### Example: Testing Locally

```bash
# Using Python
cd dist && python3 -m http.server 8080

# Using npx serve
npx serve dist

# Using any static server
```

## Routes

- `/` - QR Codes page
- `/minimap` - Live map tracking visualization
- `/widget` - Widget view (for mobile apps with query params)

## Mobile App Integration

Mobile apps load the widget URL with query parameters:

```
https://your-host.com/widget?x-stream-id=player-1&x-ms-ctrl-callback-url=...&x-ctrl-callback-url=...
```

The QR codes page generates these URLs automatically.

## No Server Needed!

This is 100% static. All configuration is baked in at build time.
