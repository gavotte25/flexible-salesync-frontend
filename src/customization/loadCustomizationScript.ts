const scriptCache = new Map<string, Promise<void>>();

export function loadCustomizationScript(src: string, token: string | null): Promise<void> {
  if (!scriptCache.has(src)) {
    scriptCache.set(
      src,
      fetch(src, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load customization script: ${src} (${res.status})`);
          }
          return res.text();
        })
        .then((code) => {
          const script = document.createElement('script');
          script.textContent = code;
          script.dataset.miscSrc = src;
          document.head.appendChild(script);
        })
    );
  }
  return scriptCache.get(src)!;
}
