#!/usr/bin/env node
/**
 * Generates static JSON files for QR code endpoints
 * These files are served as static resources and contain configuration
 * for the mobile app to load the widget with proper parameters
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually since we're in ES module mode
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

// Read configuration from environment variables (same as Vite)
const WIDGET_HOST = process.env.VITE_WIDGET_HOST || 'https://leo.frp.livelyvideo.tv';
const MS_CTRL_CALLBACK_URL = process.env.VITE_MS_CTRL_CALLBACK_URL || 'https://vulpix.zorro-prod-badlands.nativeframe.com/p/8938/foundation-transcode/msctl';
const CTRL_CALLBACK_URL = process.env.VITE_CTRL_CALLBACK_URL || 'https://vulpix.zorro-prod-badlands.nativeframe.com/p/8938/foundation-transcode/shmcli';

const STUN_URLS = ['stun:icf-prod-usw2b-turn.livelyvideo.tv:19302'];

// Generate widget URL with query parameters
function generateWidgetUrl(streamId) {
  const params = new URLSearchParams({
    'x-stream-id': streamId,
    'x-ms-ctrl-callback-url': MS_CTRL_CALLBACK_URL,
    'x-ctrl-callback-url': CTRL_CALLBACK_URL,
  });
  return `${WIDGET_HOST}/widget?${params.toString()}`;
}

// Generate JSON payload for a specific player
function generatePayload(streamId) {
  return {
    headers: {},
    metadata: {
      version: 1,
      options: {},
      widgets: [
        {
          url: generateWidgetUrl(streamId),
          headers: {},
          key: "1",
          cookies: []
        }
      ],
      location: true,
      ptt: true,
      locationHref: `${CTRL_CALLBACK_URL}/api/v1/settrack`
    },
    stun_urls: STUN_URLS,
    whip: `${MS_CTRL_CALLBACK_URL}/api/v1/whip/create/${streamId}`
  };
}

// Create output directory in dist
const outputDir = path.join(__dirname, '../dist/assets/qr/w');
fs.mkdirSync(outputDir, { recursive: true });

// Generate JSON files for 6 players
const players = ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6'];

players.forEach(playerId => {
  const payload = generatePayload(playerId);
  const outputPath = path.join(outputDir, `${playerId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`✅ Generated ${outputPath}`);
});

console.log(`\n✅ Successfully generated ${players.length} QR JSON files`);
console.log(`\nEndpoints will be available at:`);
players.forEach(playerId => {
  console.log(`  ${WIDGET_HOST}/assets/qr/w/${playerId}.json`);
});
