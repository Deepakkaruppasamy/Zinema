// Simple dominant color extractor using canvas sampling
// Returns { r, g, b } or null on failure
export default async function extractDominantColor(imgUrl, { sample = 10 } = {}) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.loading = 'eager';
      let triedProxy = false;
      const attempt = (url) => { img.src = url }
      img.src = imgUrl;
      img.onload = () => {
        try {
          const w = Math.max(1, Math.min(200, img.naturalWidth));
          const h = Math.max(1, Math.min(200, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, count = 0;
          const step = Math.max(4, Math.floor((w * h * 4) / (sample * sample)));
          for (let i = 0; i < data.length; i += step) {
            const rr = data[i];
            const gg = data[i + 1];
            const bb = data[i + 2];
            const alpha = data[i + 3];
            if (alpha < 200) continue; // skip transparent
            // Skip near-white/near-black extremes to get a nicer accent
            const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
            if (max > 245 || min < 10) continue;
            r += rr; g += gg; b += bb; count++;
          }
          if (!count) return resolve(null);
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          resolve({ r, g, b });
        } catch (_) {
          resolve(null);
        }
      };
      img.onerror = () => {
        // If the source was a TMDB image and we haven't tried the proxy, retry via server proxy.
        try {
          const tmdbPrefix = 'https://image.tmdb.org/t/p';
          if (!triedProxy && typeof imgUrl === 'string' && imgUrl.startsWith(tmdbPrefix)) {
            triedProxy = true;
            const path = imgUrl.substring(tmdbPrefix.length);
            const proxy = `/api/tmdb-image?path=${encodeURIComponent(path)}`;
            attempt(proxy);
            return;
          }
        } catch (_) {}
        resolve(null);
      };
    } catch (e) {
      resolve(null);
    }
  });
}
