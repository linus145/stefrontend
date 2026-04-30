const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is missing in .env.local configuration');
}

// If apiUrl is a relative path like '/api', use localhost:8000 for WebSockets directly
let host = '127.0.0.1:8000';
if (apiUrl.startsWith('http')) {
  host = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
}

export const appConfig = {
  apiBaseUrl: apiUrl,
  serverApiBaseUrl: apiUrl.startsWith('http') ? apiUrl : 'http://127.0.0.1:8000/api',
  wsBaseUrl: host,
};
