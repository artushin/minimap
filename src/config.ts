// Build-time configuration from environment variables
// These are injected by Vite during build time from .env file

export const WIDGET_HOST = import.meta.env.VITE_WIDGET_HOST || 'https://stream-radar.web.garage.livelyvideo.tv';
export const MS_CTRL_CALLBACK_URL = import.meta.env.VITE_MS_CTRL_CALLBACK_URL || 'https://vulpix.zorro-prod-badlands.nativeframe.com/p/8938/foundation-transcode/msctl';
export const CTRL_CALLBACK_URL = import.meta.env.VITE_CTRL_CALLBACK_URL || 'https://vulpix.zorro-prod-badlands.nativeframe.com/p/8938/foundation-transcode/shmcli';

// Derived configuration
export const MEDIA_HOST = 'vulpix.zorro-prod-badlands.nativeframe.com';
export const HLS_URL = `https://${MEDIA_HOST}/p/8938/foundation-transcode/hls/live/map_composite/index.m3u8?pt=3&ns=default`;
export const LOCATION_HREF = `${CTRL_CALLBACK_URL}/api/v1/settrack`;

/**
 * Generate widget URL with query parameters for mobile app
 */
export function generateWidgetUrl(streamId: string): string {
  const params = new URLSearchParams({
    'x-stream-id': streamId,
    'x-ms-ctrl-callback-url': MS_CTRL_CALLBACK_URL,
    'x-ctrl-callback-url': CTRL_CALLBACK_URL,
  });
  return `${WIDGET_HOST}/widget?${params.toString()}`;
}