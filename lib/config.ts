const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is missing in .env.local configuration');
}

// Extract host for WebSocket (remove protocol and /api suffix)
const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');

export const appConfig = {
  apiBaseUrl: apiUrl,
  wsBaseUrl: host,
};
