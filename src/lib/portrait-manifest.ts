let manifestCache: Record<string, string[]> | null = null;
let manifestPromise: Promise<Record<string, string[]>> | null = null;

export async function loadPortraitManifest(): Promise<Record<string, string[]>> {
  if (manifestCache) return manifestCache;
  if (manifestPromise) return manifestPromise;

  manifestPromise = (async () => {
    try {
      const response = await fetch('/media-manifest.json');
      const data = await response.json();
      manifestCache = data.portraits;
      return data.portraits;
    } catch (err) {
      console.warn('Failed to load portrait manifest:', err);
      return {};
    }
  })();

  return manifestPromise;
}
