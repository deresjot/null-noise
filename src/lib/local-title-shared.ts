export function createTitleExternalLookupKey(source: string, sourceId: string | number): string {
  return `${source}:${String(sourceId)}`;
}
