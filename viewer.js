(() => {
  const state = { scale: 1, rotation: 0, flipX: 1, flipY: 1 };

  function getImageElement() {
    return document.getElementById('clean-image-viewer-image');
  }

  function applyTransform() {
    const img = getImageElement();
    if (!img) return;
    img.style.transform = `rotate(${state.rotation}deg) scale(${state.scale}) scaleX(${state.flipX}) scaleY(${state.flipY})`;
  }

  function updateScale(amount) {
    state.scale = Math.min(Math.max(Number((state.scale + amount).toFixed(2)), 0.1), 12);
    applyTransform();
  }

  function rotate(amount) {
    state.rotation = (state.rotation + amount + 360) % 360;
    applyTransform();
  }

  function flip(axis) {
    if (axis === 'x') state.flipX *= -1;
    if (axis === 'y') state.flipY *= -1;
    applyTransform();
  }

  function resetView() {
    Object.assign(state, { scale: 1, rotation: 0, flipX: 1, flipY: 1 });
    applyTransform();
  }

  function saveImage() {
    const img = getImageElement();
    if (!img || !img.src) return;

    const link = document.createElement('a');
    const extension = (() => {
      try {
        const pathname = new URL(img.src).pathname;
        const ext = pathname.split('.').pop().toLowerCase();
        return /^[a-z0-9]{2,5}$/.test(ext) ? ext : 'png';
      } catch {
        return 'png';
      }
    })();

    link.href = img.src;
    link.download = `clean-image-viewer-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function onKeyDown(event) {

    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    const key = event.key.toLowerCase();

    if (key === 'escape') {
      window.history.back();
    } else if (key === 'r') {
      rotate(90);
    } else if (key === 'q') {
      rotate(-90);
    } else if (key === 'f') {
      flip('x');
    } else if (key === 'v') {
      flip('y');
    } else if (key === '0') {
      resetView();
    } else if (key === '+' || key === '=') {
      updateScale(0.1);
    } else if (key === '-' || key === '_') {
      updateScale(-0.1);
    } else if (key === 's') {
      saveImage();
    } else {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function run() {
    const img = getImageElement();
    if (!img) return;

    const params = new URLSearchParams(location.search);
    const imageUrl = params.get('src');

    if (!imageUrl) {
      img.alt = 'No image URL provided';
      return;
    }

    img.src = imageUrl;
    img.draggable = false;
    img.setAttribute('draggable', 'false');
    img.alt = 'Image viewer';

    img.addEventListener('wheel', (event) => {
      event.preventDefault();
      event.stopPropagation();
      updateScale(event.deltaY > 0 ? -0.1 : 0.1);
    }, { passive: false });

    img.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    applyTransform();
    document.addEventListener('keydown', onKeyDown, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
