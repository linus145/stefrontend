export const getOptimizedImage = (url: string) => {
  if (!url || !url.includes('ik.imagekit.io')) return url;
  
  // ImageKit automatic format conversion + quality optimization
  // f-auto: converted to webp/avif automatically based on browser support
  // q-auto: automatic quality optimization
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tr=f-auto,q-auto`;
};
