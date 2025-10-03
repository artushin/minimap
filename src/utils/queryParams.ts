import { MS_CTRL_CALLBACK_URL, CTRL_CALLBACK_URL } from '../config';

/**
 * Parse query parameters and set up window.REQUEST_HEADERS
 * This replaces the server-side header injection
 */
export function initializeHeadersFromQueryParams(): void {
  const params = new URLSearchParams(window.location.search);

  // Build headers object from query params, falling back to hardcoded config
  const headers: Record<string, string> = {
    'x-ms-ctrl-callback-url': params.get('x-ms-ctrl-callback-url') || MS_CTRL_CALLBACK_URL,
    'x-ctrl-callback-url': params.get('x-ctrl-callback-url') || CTRL_CALLBACK_URL,
    'x-stream-id': params.get('x-stream-id') || 'default-stream-id',
  };

  // Set on window for components to access
  (window as any).REQUEST_HEADERS = headers;

  console.log('Initialized REQUEST_HEADERS from query params:', headers);
}

/**
 * Get current request headers (for components that need them)
 */
export function getRequestHeaders(): Record<string, string> {
  return (window as any).REQUEST_HEADERS || {};
}
