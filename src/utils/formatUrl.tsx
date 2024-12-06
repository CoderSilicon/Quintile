export function formatUrl(url: string): string {
  if (url && !url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  return url;
}
