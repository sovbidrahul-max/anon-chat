/* ===== ARTWORK DATA ===== */
const artworks = [
  { id:'a1', title:'Crimson Solitude', category:'painting', medium:'Oil on Canvas', size:'100 × 80 cm', year:'2024', price:1800, gradient:'linear-gradient(135deg,#7f1d1d 0%,#dc2626 50%,#fca5a5 100%)', desc:'A meditative study in reds — solitude rendered as warmth, isolation as embrace.' },
  { id:'a2', title:'Monsoon Memory', category:'watercolour', medium:'Watercolour on Paper', size:'60 × 45 cm', year:'2024', price:680, gradient:'linear-gradient(135deg,#1e3a5f 0%,#3b82f6 60%,#93c5fd 100%)', desc:'The scent of first rain, distilled into pigment and water on cold-press paper.' },
  { id:'a3', title:'Golden Silence', category:'painting', medium:'Acrylic & Gold Leaf', size:'90 × 90 cm', year:'2023', price:2200, gradient:'linear-gradient(135deg,#451a03 0%,#92400e 50%,#f59e0b 100%)', desc:'Gold leaf pressed into acrylic impasto — the quiet between two breaths.' },
  { id:'a4', title:'Neon Reverie', category:'digital', medium:'Digital Print', size:'A1 Fine Art Print', year:'2025', price:290, gradient:'linear-gradient(135deg,#1a003a 0%,#7c3aed 50%,#f0abfc 100%)', desc:'A digital canvas where light itself becomes the brushstroke.' },
  { id:'a5', title:'Form Study No. 7', category:'sculpture', medium:'Bronze Resin', size:'28 cm height', year:'2023', price:950, gradient:'linear-gradient(135deg,#292524 0%,#78716c 60%,#d6d3d1 100%)', desc:'A limited edition cast exploring the tension between mass and void.' },
  { id:'a6', title:'Dusk Over Thar', category:'painting', medium:'Oil on Linen', size:'120 × 60 cm', year:'2024', price:3100, gradient:'linear-gradient(135deg,#431407 0%,#ea580c 40%,#fde68a 100%)', desc:'The desert sky at twilight — vast, indifferent, magnificent.' },
  { id:'a7', title:'Borrowed Light', category:'photography', medium:'Archival Pigment Print', size:'60 × 80 cm', year:'2025', price:420, gradient:'linear-gradient(135deg,#0c1a2e 0%,#1e40af 50%,#bfdbfe 100%)', desc:'Long-exposure photography catching the architecture of light itself.' },
  { id:'a8', title:'River Road', category:'watercolour', medium:'Watercolour on Cotton', size:'50 × 70 cm', year:'2023', price:560, gradient:'linear-gradient(135deg,#064e3b 0%,#10b981 50%,#d1fae5 100%)', desc:'Loose washes mapping a journey down unnamed rivers.' },
  { id:'a9', title:'Inner Cosmos', category:'digital', medium:'Digital Print on Aluminium', size:'70 × 70 cm', year:'2025', price:380, gradient:'linear-gradient(135deg,#0f172a 0%,#1d4ed8 40%,#7dd3fc 100%)', desc:'The universe rendered intimate — a cosmos small enough to hold.' },
  { id:'a10', title:'Portrait of a Stranger', category:'painting', medium:'Oil on Canvas', size:'70 × 90 cm', year:'2022', price:1500, gradient:'linear-gradient(135deg,#1c1917 0%,#57534e 50%,#e7e5e4 100%)', desc:'An imagined face, painted from memory and projection.' },
  { id:'a11', title:'Bamboo Series II', category:'photography', medium:'Archival Pigment Print', size:'40 × 60 cm', year:'2024', price:310, gradient:'linear-gradient(135deg,#14532d 0%,#16a34a 60%,#bbf7d0 100%)', desc:'Pattern, rhythm, and light filtered through a bamboo grove at dawn.' },
  { id:'a12', title:'Fragment', category:'sculpture', medium:'Marble Composite', size:'15 × 22 cm', year:'2023', price:1100, gradient:'linear-gradient(135deg,#f8fafc 0%,#cbd5e1 50%,#94a3b8 100%)', desc:'A deliberate incompleteness — beauty found in what remains.' },
];

/* Featured artworks (for quick-add buttons) */
const featuredData = {
  f1: { id:'f1', title:'Violet Reverie', category:'painting', medium:'Oil on Canvas', size:'120 × 90 cm', year:'2024', price:2400, gradient:'linear-gradient(135deg,#1a0533 0%,#6b21a8 50%,#f59e0b 100%)', desc:'A dreamlike journey through abstract purple landscapes, capturing the liminal space between consciousness and dreams.' },
  f2: { id:'f2', title:'Ocean Depth', category:'painting', medium:'Acrylic', size:'80 × 60 cm', year:'2023', price:1650, gradient:'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)', desc:'Layers of deep aquamarine built with palette knife, evoking fathomless ocean trenches.' },
  f3: { id:'f3', title:'Euphoria', category:'painting', medium:'Mixed Media', size:'70 × 70 cm', year:'2025', price:1200, gradient:'linear-gradient(135deg,#ff6b6b 0%,#feca57 50%,#ff9ff3 100%)', desc:'An explosion of joy rendered in mixed media — the feeling of pure, unguarded happiness.' },
};

/* ===== CART STATE ===== */
let cart = [];

/* ===== LOADER ===== */
window.addEventListener('DOMContentLoaded', () => {
  const progress = document.getElementById('loaderProgress');
  const loader   = document.getElementById('loader');
  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 18 + 4;
    progress.style.width = Math.min(pct, 95) + '%';
    if (pct >= 95) clearInterval(tick);
  }, 80);
  window.addEventListener('load', () => {
    clearInterval(tick);
    progress.style.width = '100%';
    setTimeout(() => loader.classList.add('hidden'), 500);
  });
  setTimeout(() => loader.classList.add('hidden'), 2800);
});

/* ===== CUSTOM CURSOR ===== */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ===== NAV SCROLL ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===== MOBILE MENU ===== */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => s.style.transform = '');
  });
});

/* ===== SCROLL REVEAL ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

/* ===== COUNTER ANIMATION ===== */
function animateCount(el, target, duration = 1800) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = parseInt(e.target.dataset.target, 10);
      animateCount(e.target, target);
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

/* ===== BUILD ART GRID ===== */
function buildGrid(filter = 'all') {
  const grid = document.getElementById('artGrid');
  grid.innerHTML = '';
  artworks.forEach(art => {
    const hidden = filter !== 'all' && art.category !== filter;
    const card = document.createElement('article');
    card.className = 'art-card' + (hidden ? ' hidden' : '');
    card.dataset.category = art.category;
    card.innerHTML = `
      <div class="art-card-img" style="background:${art.gradient}">
        <div class="art-texture"></div>
        <div class="art-card-overlay">
          <button class="quick-add" data-id="${art.id}">Add to Collection</button>
          <button class="quick-view" data-id="${art.id}">Quick View</button>
        </div>
      </div>
      <div class="art-card-body">
        <span class="art-tag">${art.medium}</span>
        <h4>${art.title}</h4>
        <div class="art-meta">
          <span class="art-size">${art.size}</span>
          <span class="art-price">$${art.price.toLocaleString()}</span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  bindCardButtons();
}

function bindCardButtons() {
  document.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const art = artworks.find(a => a.id === id) || featuredData[id];
      if (art) addToCart(art);
    });
  });
  document.querySelectorAll('.quick-view').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const art = artworks.find(a => a.id === id) || featuredData[id];
      if (art) openModal(art);
    });
  });
}

buildGrid();

/* ===== FILTER ===== */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildGrid(btn.dataset.filter);
  });
});

/* ===== MODAL ===== */
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalAddBtn  = document.getElementById('modalAddBtn');
let currentModalArt = null;

function openModal(art) {
  currentModalArt = art;
  document.getElementById('modalImg').style.background = art.gradient;
  document.getElementById('modalTag').textContent   = art.medium;
  document.getElementById('modalTitle').textContent = art.title;
  document.getElementById('modalDesc').textContent  = art.desc;
  document.getElementById('modalMedium').textContent = art.medium;
  document.getElementById('modalSize').textContent  = art.size;
  document.getElementById('modalYear').textContent  = art.year;
  document.getElementById('modalPrice').textContent = '$' + art.price.toLocaleString();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  currentModalArt = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
modalAddBtn.addEventListener('click', () => {
  if (currentModalArt) { addToCart(currentModalArt); closeModal(); }
});

/* ===== CART ===== */
const cartDrawer  = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn     = document.getElementById('cartBtn');
const cartClose   = document.getElementById('cartClose');

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(art) {
  if (cart.find(i => i.id === art.id)) {
    showToast(`"${art.title}" is already in your collection`);
    return;
  }
  cart.push(art);
  renderCart();
  updateCartCount();
  showToast(`"${art.title}" added to collection`);
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');
  const totalEl   = document.getElementById('cartTotal');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🖼</div>
        <p>Your collection is empty</p>
        <span>Discover original artworks below</span>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  container.innerHTML = cart.map(art => `
    <div class="cart-item">
      <div class="cart-item-img" style="background:${art.gradient}"></div>
      <div class="cart-item-info">
        <h5>${art.title}</h5>
        <small>${art.medium} &bull; ${art.size}</small>
      </div>
      <span class="cart-item-price">$${art.price.toLocaleString()}</span>
      <button class="cart-item-remove" data-id="${art.id}" aria-label="Remove">&#x2715;</button>
    </div>`).join('');

  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });

  const total = cart.reduce((s, i) => s + i.price, 0);
  totalEl.textContent = '$' + total.toLocaleString();
  footer.style.display = 'block';
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (cart.length === 0) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.textContent = cart.length;
}

/* ===== TOAST ===== */
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:#1a1a1a; border:1px solid #c9a96e; color:#c9a96e;
    padding:12px 28px; border-radius:4px; font-size:13px;
    z-index:9999; white-space:nowrap;
    animation: toastIn .3s ease forwards;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ===== TESTIMONIALS SLIDER ===== */
let currentSlide = 0;
const track = document.getElementById('testimonialTrack');
const dots   = document.querySelectorAll('.t-dot');

function goToSlide(idx) {
  currentSlide = idx;
  track.style.transform = `translateX(-${idx * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

dots.forEach(dot => dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.idx, 10))));

setInterval(() => goToSlide((currentSlide + 1) % dots.length), 5000);

/* ===== CONTACT FORM ===== */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn     = e.target.querySelector('button[type="submit"]');
  const success = document.getElementById('formSuccess');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.style.display = 'none';
    success.style.display = 'block';
    e.target.reset();
  }, 1200);
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
