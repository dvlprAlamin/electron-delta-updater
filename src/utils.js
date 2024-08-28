export function newBaseUrl(url) {
  const result = new URL(url);
  if (!result.pathname.endsWith('/')) {
    result.pathname += '/';
  }
  return new URL(result).href;
}

export function newUrlFromBase(pathname, baseUrl) {
  const result = new URL(pathname, baseUrl);
  return result.href;
}
