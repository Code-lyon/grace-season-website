// script.js

// ---------- Loader ----------
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 700);
  }
  // mark hero bg as loaded to trigger fade
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.classList.add('loaded');
});

// ---------- Lazy-load images using IntersectionObserver for better UX ----------
(function(){
  const lazyImages = document.querySelectorAll('img.lazy');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          const src = img.dataset.src || img.getAttribute('data-src');
          if (src) { img.src = src; img.removeAttribute('data-src'); }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, {rootMargin: '200px 0px'});
    lazyImages.forEach(img => io.observe(img));
  } else {
    // fallback: load all
    lazyImages.forEach(img => {
      const src = img.dataset.src || img.getAttribute('data-src');
      if (src) img.src = src;
      img.classList.remove('lazy');
    });
  }
})();

// ---------- Fade-in sections on scroll ----------
(function(){
  const sections = document.querySelectorAll('.fade-section');
  if ('IntersectionObserver' in window) {
    const secObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    sections.forEach(s => secObserver.observe(s));
  } else {
    sections.forEach(s => s.classList.add('visible'));
  }
})();

// ---------- Scroll to top button ----------
(function(){
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  function update() {
    if (window.scrollY > 300) { btn.classList.add('show'); btn.style.opacity = '1'; btn.style.display = 'flex'; }
    else { btn.classList.remove('show'); btn.style.opacity = '0'; setTimeout(()=> btn.style.display='none',300); }
  }
  window.addEventListener('scroll', update);
  update();
  btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
})();

// ---------- Lightbox modal with thumbnails + keyboard navigation ----------
(function(){
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbThumbs = document.getElementById('lbThumbs');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  if (!lightbox) return;

  let currentSet = [];
  let currentIndex = 0;

  // open modal from image click
  function openLightboxFromImg(imgEl) {
    // collect all images in same card-preview
    const container = imgEl.closest('.card-preview') || imgEl.closest('.gallery') || imgEl.parentElement;
    const images = Array.from(container.querySelectorAll('.item-img, img')).filter(i=>i.dataset && (i.dataset.src || i.src));
    currentSet = images.map(i => {
      return {
        src: i.src || i.dataset.src || i.getAttribute('data-src'),
        alt: i.alt || '',
        price: i.dataset.price || ''
      };
    });
    currentIndex = images.indexOf(imgEl);
    showLightbox();
  }

  function showLightbox(){
    renderThumbs();
    updateMain();
    lightbox.classList.remove('lb-hidden');
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(()=> lightbox.focus && lightbox.focus(),50);
  }

  function closeLightbox(){
    lightbox.classList.add('lb-hidden');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  function renderThumbs(){
    lbThumbs.innerHTML = '';
    currentSet.forEach((it, idx) => {
      const el = document.createElement('img');
      el.src = it.src;
      el.className = 'lb-thumb';
      el.dataset.index = idx;
      el.alt = it.alt || `Image ${idx+1}`;
      el.addEventListener('click', () => { currentIndex = idx; updateMain();});
      lbThumbs.appendChild(el);
    });
  }

  function updateMain(){
    const item = currentSet[currentIndex];
    lbImage.src = item.src;
    lbImage.alt = item.alt || '';
    lbCaption.textContent = item.alt || (item.price ? item.price : '');
    // update active thumbnail
    const thumbs = lbThumbs.querySelectorAll('.lb-thumb');
    thumbs.forEach(t => t.classList.toggle('active', Number(t.dataset.index) === currentIndex));
  }

  // keyboard navigation
  function onKey(e){
    if (lightbox.classList.contains('lb-hidden')) return;
    if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + currentSet.length) % currentSet.length; updateMain(); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % currentSet.length; updateMain(); }
    if (e.key === 'Escape') closeLightbox();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => { currentIndex = (currentIndex - 1 + currentSet.length) % currentSet.length; updateMain(); });
  lbNext.addEventListener('click', () => { currentIndex = (currentIndex + 1) % currentSet.length; updateMain(); });

  lightbox.addEventListener('click', (ev) => {
    if (ev.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', onKey);

  // attach image click handlers (delegation)
  document.addEventListener('click', (ev) => {
    const img = ev.target.closest('.item-img');
    if (img) {
      ev.preventDefault();
      openLightboxFromImg(img);
    }
  });
})();


// ---------- Attach dynamic price badges next to images (so each image shows a badge on hover) ----------
(function(){
  // for each item-img with data-price create a badge element overlay
  const itemImgs = document.querySelectorAll('.item-img');
  itemImgs.forEach(img => {
    const price = img.dataset.price;
    if (!price) return;
    // wrapper to position badge
    const wrapper = img.parentElement;
    // ensure wrapper has position:relative
    wrapper.style.position = wrapper.style.position || 'relative';
    const badge = document.createElement('div');
    badge.className = 'price-badge';
    badge.textContent = price;
    wrapper.appendChild(badge);

    // sizes overlay (for gallery items)
    const sizes = document.createElement('div');
    sizes.className = 'sizes';
    sizes.innerHTML = '<strong>Sizes:</strong> <span>M</span> <span>L</span> <span>XL</span> <span>XXL</span>';
    wrapper.appendChild(sizes);
  });
})();
