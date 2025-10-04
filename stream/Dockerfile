# Multi-stage build for efficient image size
FROM ubuntu:22.04 AS base

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Basic utilities
    curl \
    wget \
    gnupg \
    software-properties-common \
    ca-certificates \
    lsb-release \
    # Virtual display
    xvfb \
    x11vnc \
    x11-utils \
    x11-xkb-utils \
    xfonts-100dpi \
    xfonts-75dpi \
    xfonts-scalable \
    xfonts-cyrillic \
    xserver-xorg-core \
    xserver-xorg-video-dummy \
    # DBus for Chrome
    dbus \
    dbus-x11 \
    # Build tools
    build-essential \
    pkg-config \
    git \
    cmake \
    # FFmpeg
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright with dependencies
RUN npm install -g playwright@latest \
    && npx playwright install chromium \
    && npx playwright install-deps chromium

# No need to build WHIP client - using FFmpeg RTMP instead

# Create non-root user for running browser
RUN useradd -m -s /bin/bash streamer \
    && usermod -aG audio,video streamer

# Create required directories with proper permissions
RUN mkdir -p /tmp/.X11-unix /run/dbus /var/run/dbus \
    && chmod 1777 /tmp/.X11-unix \
    && chmod 755 /run/dbus /var/run/dbus

# Set up working directory
WORKDIR /app

RUN echo "Cache bust: $(date +%s)" > /tmp/cachebust
COPY ./scripts/browser-launcher.js /app/browser-launcher.js
COPY ./scripts/start-streaming.sh /app/start-streaming.sh
COPY ./scripts/healthcheck.sh /app/healthcheck.sh
COPY ./scripts/docker-entrypoint.sh /app/entrypoint.sh

# Create package.json if not provided
RUN echo '{"name":"browser-rtmp-streamer","version":"1.0.0","dependencies":{"playwright":"^1.40.0"}}' > package.json

# Install Node dependencies
RUN npm install

# Set up volumes for persistent data
VOLUME ["/data"]

# Expose ports (optional, for debugging or web interfaces)
EXPOSE 5900 8080

# Set environment variables defaults
ENV DISPLAY_NUM=99 \
    SCREEN_WIDTH=1920 \
    SCREEN_HEIGHT=1080 \
    SCREEN_DEPTH=24 \
    FRAMERATE=30 \
    BITRATE=2500000 \
    BROWSER_TYPE=chrome

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD /app/healthcheck.sh || exit 1

# Switch to non-root user (commented out for debugging)
# USER streamer

# Entry point
ENTRYPOINT ["/app/entrypoint.sh"]