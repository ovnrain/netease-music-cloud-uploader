export function replaceHttpWithHttps(url?: string) {
  return url?.replace(/^http:/, 'https:');
}
