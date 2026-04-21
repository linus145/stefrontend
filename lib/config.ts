const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is missing in .env.local configuration');
}

export const appConfig = {
  apiBaseUrl: apiUrl,
};
