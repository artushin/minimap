# Live Tracking Widget - Static React Application

## IMPORTANT: Read First
**ALWAYS read `./widget/DEPLOY.md` at the start of each session** for deployment and architecture information.

### Critical Rules
1. **NO SERVERS**: This is a 100% static application. Never suggest adding server.js, API servers, or backend logic.
2. **Build-time config only**: All configuration comes from `.env` and is baked into the bundle at build time.
3. **Static deployment**: The output is pure HTML/CSS/JS files in `widget/dist/` that can be deployed to S3, CDN, etc.
4. If the user asks about servers, remind them this is a static-only project.

## Project Overview
This is a fully static React application for real-time coordinate tracking visualization. It consists of three main pages:
1. **QR Codes Page** - Generates QR codes for mobile app integration
2. **Minimap Page** - Google Maps-based live tracking overlay for OBS streaming
3. **Widget Page** - Mobile app view with map/compass toggle

## Architecture Philosophy

### NO SERVERS ALLOWED
- **This is a 100% static application** - all files in `./widget/dist/` are pure static HTML/CSS/JS
- **All configuration is injected at build time** via Vite environment variables (`.env` file)
- **No backend, no API server, no Node.js at runtime** - just static files
- Deployable to S3, CloudFront, Netlify, GitHub Pages, or any CDN
- The only "server" needed is whatever static file host you choose (S3, CDN, etc.)

### Build-Time Configuration
All configuration is in `./widget/.env`:
- `VITE_WIDGET_HOST` - Where the widget is hosted
- `VITE_MS_CTRL_CALLBACK_URL` - Media server control callback URL
- `VITE_CTRL_CALLBACK_URL` - Control callback URL
- `VITE_QR_BASE_URL` - Base URL for QR code generation

These values are **baked into the JavaScript bundle** at build time.

## Current Implementation

### File Structure
- `./widget/` - React application (Vite + React + TypeScript + React Router)
  - `src/Pages/QRCodesPage.tsx` - QR code generation page
  - `src/Pages/MinimapPage.tsx` - Google Maps tracking overlay
  - `src/Pages/WidgetPage.tsx` - Mobile widget view (map/compass)
  - `src/config.ts` - Build-time configuration
  - `dist/` - Production build output (static files only)
- Legacy files (deprecated, keep for reference):
  - `google-maps-tracker.html` - Original single-file prototype
  - `qr-codes.html` - Original QR page (replaced by React version)
  - `minimap.html` - Original minimap (replaced by React version)
  - `server.js` - Old server-rendered version (NO LONGER USED)
  - `server-api.js` - API-only server (NO LONGER USED)

### Core Features

#### 1. QR Codes Page (`/`)
- Client-side QR code generation using QRCode.js library
- Generates 6 QR codes for players (player-1 through player-6)
- Each QR code contains a widget URL with all configuration encoded as query parameters
- Flip card UI - click to reveal QR code
- Mobile app scans QR code to get widget URL with all parameters

#### 2. Minimap Page (`/minimap`)
- **OBS-Optimized Display**
  - Pure black background for easy keying/compositing
  - Minimal UI - radar/grid overlay effects
  - Portrait orientation optimized for streaming
  - No user interaction controls
- **Map Configuration**
  - Google Maps JavaScript API integration
  - Dark-themed map styling
  - Maximum zoom level (19-21) for detailed view
  - Auto-bounds adjustment to keep all points visible
- **Real-time Coordinate Tracking**
  - Polls media server for player positions (500ms intervals)
  - Multiple colored markers for different players
  - Smooth marker updates
  - Posts map bounds back to media server for compositing

#### 3. Widget Page (`/widget`)
- Mobile app view with two modes:
  - **Map Mode**: WebRTC video stream of map composite
  - **Compass Mode**: Circular compass showing relative positions of other players
- Toggle between modes with bottom nav buttons
- Reads configuration from URL query parameters:
  - `x-stream-id` - Current player ID
  - `x-ms-ctrl-callback-url` - Media server control URL
  - `x-ctrl-callback-url` - Control callback URL

## Build & Deploy

### Building
```bash
cd widget
yarn install
yarn build
```

Output is in `widget/dist/` - these are pure static files.

### Development
```bash
cd widget
yarn dev
```

Runs on http://localhost:3000

### Deployment
The `widget/dist/` directory can be deployed to any static host:
- S3 + CloudFront
- Netlify / Vercel
- GitHub Pages
- Any CDN

**Important**: Configure your host for SPA routing (serve `index.html` for all routes).

See `widget/DEPLOY.md` for detailed deployment instructions.

## Technical Details

### Query Parameter Flow
1. Mobile app scans QR code from QR Codes page
2. QR code contains widget URL with query params:
   - `x-stream-id=player-1`
   - `x-ms-ctrl-callback-url=https://...`
   - `x-ctrl-callback-url=https://...`
3. Widget reads params in `src/utils/queryParams.ts` and sets `window.REQUEST_HEADERS`
4. Components use these headers to identify the current player and make API calls

### Data Flow
1. Widget polls media server at `CTRL_CALLBACK_URL/api/v1/streams` (250ms intervals)
2. Parses `appData` field for player coordinates (latitude/longitude/heading)
3. Updates UI (map markers or compass orbs)
4. Minimap posts map bounds back to media server for compositing

### WebRTC Integration
- Map view uses WebRTC (mediasoup-client) for Chrome browsers
- Falls back to HLS for other browsers
- Discovers callback URLs from `window.REQUEST_HEADERS`
- Connects to media server to consume map composite stream

## Mobile App Integration

Mobile apps should:
1. Scan QR code to get widget URL with all parameters
2. Open widget in webview with the full URL (including query params)
3. Widget handles everything else client-side

## Key Architectural Decisions

### Why Static?
- **Scalability**: Deploy to CDN, no server costs
- **Simplicity**: No backend to maintain, no API server to deploy
- **Security**: No server-side secrets, all config is build-time
- **Performance**: Served from CDN edge locations

### Why Query Params?
- Mobile apps can't set custom HTTP headers in webviews
- Query params work universally across all platforms
- No server needed to inject headers
- Easy to generate URLs client-side (QR codes page)

### Why Build-Time Config?
- No environment-specific runtime logic
- Single build works across all environments
- Configuration is explicit and version-controlled
- No configuration drift between deployments