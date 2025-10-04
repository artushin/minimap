
#!/bin/bash
set -e

# Configuration from environment variables
DISPLAY_NUM="${DISPLAY_NUM:-99}"
SCREEN_WIDTH="${SCREEN_WIDTH:-1920}"
SCREEN_HEIGHT="${SCREEN_HEIGHT:-1080}"
SCREEN_DEPTH="${SCREEN_DEPTH:-24}"
FRAMERATE="${FRAMERATE:-30}"
BITRATE="${BITRATE:-2500000}"
RTMP_URL="${RTMP_URL}"
BROWSER_URL="${BROWSER_URL:-https://example.com}"

# Validate required variables
if [ -z "$RTMP_URL" ]; then
echo "Error: RTMP_URL environment variable is required"
exit 1
fi

# Start DBus
echo "Starting DBus..."
mkdir -p /var/run/dbus
dbus-daemon --system --fork 2>/dev/null || true

echo "Starting virtual display..."
# Start Xvfb
Xvfb :$DISPLAY_NUM \
    -screen 0 ${SCREEN_WIDTH}x${SCREEN_HEIGHT}x${SCREEN_DEPTH} \
    -ac \
    +extension GLX \
    +render \
    -noreset &
XVFB_PID=$!

# Wait for Xvfb to start
sleep 2

# Set display
export DISPLAY=:$DISPLAY_NUM

# Launch browser (skip in test mode to avoid libsoup conflicts)
if [ "$TEST_MODE" != "true" ]; then
echo "Launching browser to $BROWSER_URL..."
if [ "$BROWSER_TYPE" = "playwright" ]; then
# Using Playwright
node /app/browser-launcher.js &
else
# Using Chrome directly
google-chrome-stable \
    --no-sandbox \
    --disable-gpu \
    --disable-dev-shm-usage \
    --disable-setuid-sandbox \
    --no-first-run \
    --no-default-browser-check \
    --disable-blink-features=AutomationControlled \
    --user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
    --window-size=${SCREEN_WIDTH},${SCREEN_HEIGHT} \
    --window-position=0,0 \
    --autoplay-policy=no-user-gesture-required \
    --enable-usermedia-screen-capturing \
    --allow-http-screen-capture \
    --auto-select-desktop-capture-source="$BROWSER_URL" \
    "$BROWSER_URL" &
fi
BROWSER_PID=$!

# Wait for browser to fully load
sleep 10
else
echo "Skipping browser launch (TEST_MODE=true)"
# Create a test pattern on the display
sleep 5
BROWSER_PID=$$
fi

# Start FFmpeg RTMP streaming (video only)
echo "Starting FFmpeg RTMP streaming to $RTMP_URL..."

ffmpeg -nostdin -hide_banner \
    -f x11grab -video_size ${SCREEN_WIDTH}x${SCREEN_HEIGHT} -framerate $FRAMERATE -i :$DISPLAY_NUM \
    -c:v libx264 -preset veryfast -tune zerolatency \
    -b:v $BITRATE -maxrate $BITRATE -bufsize $((BITRATE*2)) \
    -g $((FRAMERATE*2)) -keyint_min $FRAMERATE \
    -pix_fmt yuv420p \
    -f flv "$RTMP_URL"

# Keep container running
if [ -n "$BROWSER_PID" ] && [ "$BROWSER_PID" != "$$" ]; then
wait $BROWSER_PID
else
# If no browser PID or test mode, wait for the streaming process
wait
fi