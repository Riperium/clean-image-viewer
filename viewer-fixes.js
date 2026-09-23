(() => {
  'use strict';

  // The social viewer can discover the same Reddit/X image through more than
  // one DOM element (thumbnail, lightbox and preview). When that happens it
  // creates a false gallery. Hide navigation whenever the page only contains
  // one real media source.
  const ignored = /avatar|profile|icon|emoji|logo|thumbnail|favicon/i;

  function candidateSources() {
    return new Set([...document.images]
      .filter((img) => !img.closest('#clean-image-viewer-root'))
      .filter((img) => {
        const source = img.currentSrc || img.src || img.getAttribute('data-image-url') || '';
        const label = `${img.alt || ''} ${img.getAttribute('aria-label') || ''}`;
        const width = img.naturalWidth || Number(img.width) || 0;
        const height = img.naturalHeight || Number(img.height) || 0;
        return source && !source.startsWith('data:') && !ignored.test(label) && (!width || !height || (width >= 120 && height >= 120));
      })
      .map((img) => img.currentSrc || img.src || img.getAttribute('data-image-url')));
  }

  function updateNavigation() {
    const viewer = document.getElementById('clean-image-viewer-root');
    if (!viewer) return;

    const previous = document.getElementById('clean-image-viewer-prev');
    const next = document.getElementById('clean-image-viewer-next');
    if (!previous && !next) return;

    const counter = document.getElementById('clean-image-viewer-counter');
    const sources = candidateSources();
    // A direct image page or Reddit's /media?url=... page has one source.
    // Do not show inactive gallery controls in that case.
    const single = sources.size <= 1 || (counter && !counter.textContent.trim());
    if (single) {
      previous?.remove();
      next?.remove();
      if (counter) counter.remove();
    }
  }

  const observer = new MutationObserver(updateNavigation);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', updateNavigation, { once: true });
  setInterval(updateNavigation, 250);
})();
