# Headless Browser RTMP Streaming Docker Setup

Stream any browser-based widget or web application to your media server using RTMP protocol from a headless Docker container.

> **Note**: This project previously used WHIP (WebRTC-HTTP Ingestion Protocol) but has been migrated to RTMP for better compatibility and simplified deployment. RTMP is widely supported by media servers and streaming platforms.

## Overview

This solution provides a production-ready Docker setup for streaming browser content to any RTMP-compatible endpoint. It combines:

- **Headless Chrome/Chromium** for rendering web content
- **Xvfb** (X Virtual Framebuffer) for virtual display
- **FFmpeg** for video encoding and RTMP streaming
- **Playwright** (optional) for advanced browser automation

## Features

- ✅ RTMP protocol for universal streaming compatibility
- ✅ Video-only capture (audio removed for simplified setup)
- ✅ Configurable resolution, framerate, and bitrate
- ✅ Browser automation support with Playwright
- ✅ Health checks and monitoring
- ✅ Non-root user execution for security
- ✅ Docker Compose configuration included
- ✅ Lightweight image (~3GB)

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container                 │
│                                          │
│  ┌──────────┐     ┌─────────────┐       │
│  │  Chrome  │────▶│    Xvfb     │       │
│  │ Browser  │     │  (Virtual   │       │
│  └──────────┘     │   Display)  │       │
│                   └─────────────┘       │
│                          │               │
│                          ▼               │
│                   ┌─────────────┐       │
│                   │   FFmpeg    │       │
│                   │  Encoder    │       │
│                   └─────────────┘       │
│                          │               │
└──────────────────────────┼───────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ RTMP Server │
                   │ (MediaMTX,  │
                   │  OBS, etc)  │
                   └─────────────┘
```

## Requirements

### For RTMP Server
- Any RTMP-compatible server (MediaMTX, nginx-rtmp, OBS Studio, etc.)
- RTMP endpoint URL

### For Docker Host
- Docker 20.10+
- Docker Compose 2.0+
- At least 2 CPU cores
- 4GB RAM minimum
- Linux host (recommended) or WSL2 on Windows

## Quick Start

### 1. Clone or Create Project

```bash
mkdir browser-rtmp-streamer
cd browser-rtmp-streamer
```

### 2. Build the Image

```bash
docker build -t browser-rtmp-streamer .
```

### 3. Run the Container

```bash
# Set required environment variables
export RTMP_URL="rtmp://your-server.com:1935/live/stream"
export BROWSER_URL="https://example.com/your-widget"

# Start streaming
docker run --rm \
  -e RTMP_URL="$RTMP_URL" \
  -e BROWSER_URL="$BROWSER_URL" \
  browser-rtmp-streamer
```

## Configuration

### Environment Variables

| Variable        | Description                              | Default               |
| --------------- | ---------------------------------------- | --------------------- |
| `RTMP_URL`      | **Required** - RTMP server endpoint URL  | -                     |
| `BROWSER_URL`   | URL to load in browser                   | `https://example.com` |
| `DISPLAY_NUM`   | Virtual display number                   | `99`                  |
| `SCREEN_WIDTH`  | Screen width in pixels                   | `1920`                |
| `SCREEN_HEIGHT` | Screen height in pixels                  | `1080`                |
| `SCREEN_DEPTH`  | Color depth                              | `24`                  |
| `FRAMERATE`     | Video framerate                          | `30`                  |
| `BITRATE`       | Video bitrate in bits/sec                | `2500000`             |
| `BROWSER_TYPE`  | Browser launcher type (`chrome`)         | `chrome`              |
| `TEST_MODE`     | Skip browser launch for testing          | `false`               |

### Example RTMP Servers

#### MediaMTX (Recommended)
```bash
# Install MediaMTX: https://github.com/bluenviron/mediamtx
# Default RTMP endpoint
RTMP_URL="rtmp://localhost:1935/live/stream"
```

#### OBS Studio
```bash
# Configure OBS to accept RTMP input
# Settings -> Stream -> Service: Custom
# Server: rtmp://localhost:1935/live
RTMP_URL="rtmp://localhost:1935/live/stream"
```

#### nginx-rtmp
```bash
# Configure nginx with rtmp module
RTMP_URL="rtmp://your-nginx-server:1935/live/stream"
```

#### Cloud Streaming Services
```bash
# YouTube Live
RTMP_URL="rtmp://a.rtmp.youtube.com/live2/your-stream-key"

# Twitch
RTMP_URL="rtmp://live.twitch.tv/app/your-stream-key"

# Facebook Live
RTMP_URL="rtmps://live-api-s.facebook.com:443/rtmp/your-stream-key"
```

## Testing

### Test Without Browser

Verify FFmpeg can connect to your RTMP endpoint:

```bash
docker run --rm \
  -e RTMP_URL="rtmp://your-server.com:1935/live/stream" \
  -e TEST_MODE=true \
  browser-rtmp-streamer
```

This will capture the virtual display (black screen) and stream to RTMP. Check your RTMP server logs to confirm connection.

### Test With Browser

```bash
docker run --rm \
  -e RTMP_URL="rtmp://your-server.com:1935/live/stream" \
  -e BROWSER_URL="https://example.com" \
  browser-rtmp-streamer
```

## Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  browser-streamer:
    build: .
    image: browser-rtmp-streamer
    container_name: browser-rtmp-streamer
    environment:
      - RTMP_URL=${RTMP_URL}
      - BROWSER_URL=${BROWSER_URL:-https://example.com}
      - SCREEN_WIDTH=${SCREEN_WIDTH:-1920}
      - SCREEN_HEIGHT=${SCREEN_HEIGHT:-1080}
      - FRAMERATE=${FRAMERATE:-30}
      - BITRATE=${BITRATE:-2500000}
    restart: unless-stopped
    shm_size: '2gb'
```

Create `.env`:

```bash
RTMP_URL=rtmp://your-server.com:1935/live/stream
BROWSER_URL=https://your-app.com/widget
```

Run with:

```bash
docker-compose up -d
```

## Advanced Usage

### Using Playwright for Complex Interactions

Set `BROWSER_TYPE=playwright` and customize `browser-launcher.js`:

```javascript
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(process.env.BROWSER_URL);

    // Login automation
    await page.fill('#username', 'user@example.com');
    await page.fill('#password', 'password');
    await page.click('#login-button');

    // Navigate to widget
    await page.waitForSelector('#widget-container');

    // Keep running
    await new Promise(() => {});
})();
```

### Monitoring with VNC

Add x11vnc to view the virtual display:

```bash
docker run --rm \
  -e RTMP_URL="$RTMP_URL" \
  -e BROWSER_URL="$BROWSER_URL" \
  -p 5900:5900 \
  browser-rtmp-streamer
```

Connect with any VNC client to `localhost:5900`.

## Performance Optimization

### Reduce Bitrate/Resolution

```bash
# Lower quality for bandwidth-constrained environments
docker run --rm \
  -e RTMP_URL="$RTMP_URL" \
  -e SCREEN_WIDTH=1280 \
  -e SCREEN_HEIGHT=720 \
  -e FRAMERATE=24 \
  -e BITRATE=1500000 \
  browser-rtmp-streamer
```

### CPU Pinning

```yaml
# docker-compose.yml
services:
  browser-streamer:
    cpuset: "0,1"  # Pin to specific CPU cores
```

## Troubleshooting

### Common Issues

#### 1. "RTMP_URL environment variable is required"
Make sure to set the `RTMP_URL` environment variable:
```bash
docker run -e RTMP_URL="rtmp://..." browser-rtmp-streamer
```

#### 2. Connection Refused
- Verify RTMP server is running: `telnet your-server.com 1935`
- Check firewall rules
- Ensure RTMP URL format is correct: `rtmp://host:port/app/stream`

#### 3. Browser Crashes
- Increase shared memory: `--shm-size=4gb`
- Add `--disable-dev-shm-usage` to Chrome args

#### 4. High CPU Usage
- Lower framerate: `FRAMERATE=15`
- Reduce resolution: `SCREEN_WIDTH=1280 SCREEN_HEIGHT=720`
- Lower bitrate: `BITRATE=1000000`

#### 5. DBus Errors
DBus errors are warnings and can be safely ignored. Chrome runs fine without full DBus support.

### Debug Mode

Check container logs:

```bash
docker logs -f browser-rtmp-streamer
```

Run interactively:

```bash
docker run --rm -it \
  -e RTMP_URL="$RTMP_URL" \
  --entrypoint /bin/bash \
  browser-rtmp-streamer
```

## Migration from WHIP

If you're migrating from the previous WHIP-based setup:

1. **Environment Variables**: Replace `WHIP_URL` with `RTMP_URL`
2. **Remove**: `WHIP_TOKEN` is no longer needed (use RTMP authentication if required)
3. **Remove**: `STREAM_MODE` environment variable (now always uses FFmpeg + RTMP)
4. **Rebuild**: `docker build -t browser-rtmp-streamer .`

### Why RTMP?

We migrated from WHIP to RTMP because:
- **Universal compatibility**: RTMP is supported by virtually all streaming platforms
- **Simpler deployment**: No complex WebRTC signaling or WHIP gateway needed
- **Fewer dependencies**: Removed GStreamer, libsoup, and WebRTC libraries
- **Smaller image**: ~800MB smaller (3GB vs 3.8GB)
- **Better stability**: FFmpeg + RTMP is battle-tested and widely used

## Production Deployment

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: browser-streamer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: browser-streamer
  template:
    metadata:
      labels:
        app: browser-streamer
    spec:
      containers:
      - name: streamer
        image: your-registry/browser-rtmp-streamer:latest
        env:
        - name: RTMP_URL
          valueFrom:
            secretKeyRef:
              name: streaming-secrets
              key: rtmp-url
        - name: BROWSER_URL
          value: "https://your-app.com/widget"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
```

## Security Considerations

1. **Run as non-root user** (already configured)
2. **Use secrets management** for sensitive URLs
3. **Network isolation** with custom Docker networks
4. **Resource limits** to prevent DoS
5. **Regular security updates** of base images

## License

MIT

## Contributing

Pull requests welcome! Please ensure:
- Code follows existing style
- Tests pass
- Documentation is updated
- Security best practices are followed
