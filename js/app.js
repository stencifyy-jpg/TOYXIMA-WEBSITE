// TOYXIMA Toys - Main Application Controller
import { store } from './store.js';
import { sounds } from './sound.js';
import { CATEGORIES, AGE_RANGES } from './products.js';
// import { Wonderland3D } from './wonderland3d.js'; // No longer used - hero now uses CSS animations

class App {
  constructor() {
    this.currentView = 'home';
    this.activeCategory = 'all';
    this.activeAge = 'all';
    this.searchQuery = '';
    this.sortOption = 'featured';
    this.maxPrice = 100;
    this.selectedProduct = null;
    this.heroAnimationFrame = null;
    this.editingProduct = null;

    this.init();
  }

  init() {
    // Subscribe to store updates
    store.subscribe((event, data) => {
      this.handleStoreEvent(event, data);
    });

    // Hash routing
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Initial render
    this.handleHashChange();
    this.renderHeader();
    this.renderCartDrawer();
    this.renderToastContainer();
    this.initGlobalEvents();

    // Re-render icons if Lucide is loaded
    this.refreshIcons();
  }

  handleStoreEvent(event, data) {
    if (event === 'cart_updated') {
      this.updateCartBadge();
      this.renderCartDrawerContent();
    } else if (event === 'wishlist_updated') {
      this.updateWishlistBadge();
      if (this.currentView === 'shop' || this.currentView === 'home') {
        this.renderCurrentView();
      }
    } else if (event === 'products_updated') {
      if (this.currentView === 'shop' || this.currentView === 'home' || this.currentView === 'admin') {
        this.renderCurrentView();
      }
      this.showToast('Inventory updated successfully! 🧸', 'success');
    } else if (event === 'sound_toggle') {
      this.updateSoundButton();
    }
  }

  handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const [view, param] = hash.split('/');

    if (view === 'product' && param) {
      const prod = store.getProductById(param);
      if (prod) {
        this.selectedProduct = prod;
        this.currentView = 'product-detail';
      } else {
        this.currentView = 'shop';
      }
    } else {
      this.currentView = ['home', 'shop', 'about', 'contact', 'admin'].includes(view) ? view : 'home';
      this.selectedProduct = null;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderCurrentView();
    this.updateActiveNavLinks();
  }

  navigate(path) {
    sounds.playPop();
    window.location.hash = path;
  }

  refreshIcons() {
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 50);
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : type === 'warning' ? 'bg-amber-600' : 'bg-orange-600';
    toast.className = `${bg} text-white px-5 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0`;
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ----------------------------------------------------
  // Header & Navigation
  // ----------------------------------------------------
  renderHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    header.innerHTML = `
      <!-- Top Announcement Ribbon -->
      <div class="bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 text-white text-xs font-bold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span class="animate-bounce">🌟</span>
        <span>Welcome to TOYXIMA! Free Magic Gift Wrapping & Free Shipping on orders over $60</span>
        <span class="hidden md:inline px-2 py-0.5 bg-white/20 rounded-full text-[11px]">Code: MAGIC10</span>
      </div>

      <!-- Main Navigation Bar -->
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <!-- Logo -->
        <a href="#home" class="flex items-center gap-2 group">
          <img src="assets/toyxima-logo-transparent.png" alt="Toyxima" class="h-10 sm:h-12 w-auto object-contain transform group-hover:scale-105 transition-all duration-300 drop-shadow-xs" />
        </a>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center gap-1 bg-amber-50/80 p-1.5 rounded-full border border-amber-200/60 shadow-inner">
          <a href="#home" class="nav-link px-4 py-1.5 rounded-full text-sm font-bold transition-all" data-view="home">Home</a>
          <a href="#shop" class="nav-link px-4 py-1.5 rounded-full text-sm font-bold transition-all" data-view="shop">Toy Shop</a>
          <a href="#about" class="nav-link px-4 py-1.5 rounded-full text-sm font-bold transition-all" data-view="about">Our Story</a>
          <a href="#contact" class="nav-link px-4 py-1.5 rounded-full text-sm font-bold transition-all" data-view="contact">Contact & Help</a>
        </div>

        <!-- Right Utility Actions -->
        <div class="flex items-center gap-2">
          <!-- Admin Inventory Toggle -->
          <a href="#admin" class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all border border-stone-200" title="Manage Toys & Inventory">
            <i data-lucide="package-plus" class="w-3.5 h-3.5 text-stone-600"></i>
            <span>Manage Toys</span>
          </a>

          <!-- Sound Toggle Button -->
          <button id="sound-btn" class="p-2.5 rounded-full bg-amber-100/70 hover:bg-amber-200 text-stone-700 transition-all" title="Toggle Toy Sound Effects">
            <i data-lucide="${store.soundEnabled ? 'volume-2' : 'volume-x'}" class="w-4 h-4"></i>
          </button>

          <!-- Wishlist Button -->
          <button id="wishlist-btn" class="relative p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all" title="Wishlist">
            <i data-lucide="heart" class="w-4 h-4"></i>
            <span id="wishlist-badge" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow ${store.wishlist.length ? '' : 'hidden'}">
              ${store.wishlist.length}
            </span>
          </button>

          <!-- Cart Drawer Button -->
          <button id="cart-drawer-toggle" class="btn-bubbly relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            <span class="hidden sm:inline">Cart</span>
            <span id="header-cart-badge" class="w-5 h-5 rounded-full bg-white text-orange-600 text-[11px] font-black flex items-center justify-center">
              ${store.getCartCount()}
            </span>
          </button>
        </div>
      </nav>

      <!-- Mobile Sub-Nav Bar -->
      <div class="md:hidden flex items-center justify-around py-2 border-t border-amber-200/40 bg-amber-50/50 text-xs font-bold">
        <a href="#home" class="nav-link py-1 px-2 rounded-lg" data-view="home">Home</a>
        <a href="#shop" class="nav-link py-1 px-2 rounded-lg" data-view="shop">Shop</a>
        <a href="#about" class="nav-link py-1 px-2 rounded-lg" data-view="about">Story</a>
        <a href="#contact" class="nav-link py-1 px-2 rounded-lg" data-view="contact">Contact</a>
        <a href="#admin" class="nav-link py-1 px-2 rounded-lg text-orange-600" data-view="admin">Admin</a>
      </div>
    `;

    // Sound button toggle
    document.getElementById('sound-btn')?.addEventListener('click', () => {
      const isEnabled = store.toggleSound();
      sounds.init();
      if (isEnabled) sounds.playPop();
      this.showToast(isEnabled ? 'Sound effects turned ON 🎶' : 'Sound effects muted 🔕', 'info');
    });

    // Wishlist shortcut: jump to shop with filter or toast
    document.getElementById('wishlist-btn')?.addEventListener('click', () => {
      sounds.playPop();
      if (store.wishlist.length === 0) {
        this.showToast('Your wishlist is empty. Tap the heart on toys you love! ❤️', 'info');
      } else {
        window.location.hash = 'shop';
        this.showToast(`You have ${store.wishlist.length} saved favorites!`, 'info');
      }
    });

    // Cart open
    document.getElementById('cart-drawer-toggle')?.addEventListener('click', () => {
      sounds.playPop();
      this.toggleCartDrawer(true);
    });

    this.updateActiveNavLinks();
    this.refreshIcons();
  }

  updateSoundButton() {
    const btn = document.getElementById('sound-btn');
    if (!btn) return;
    btn.innerHTML = `<i data-lucide="${store.soundEnabled ? 'volume-2' : 'volume-x'}" class="w-4 h-4"></i>`;
    this.refreshIcons();
  }

  updateActiveNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const view = link.getAttribute('data-view');
      if (view === this.currentView) {
        link.className = "nav-link px-4 py-1.5 rounded-full text-sm font-bold bg-orange-500 text-white shadow-sm transition-all";
      } else {
        link.className = "nav-link px-4 py-1.5 rounded-full text-sm font-bold text-stone-700 hover:text-orange-600 hover:bg-amber-100/60 transition-all";
      }
    });
  }

  updateCartBadge() {
    const badge = document.getElementById('header-cart-badge');
    if (badge) {
      badge.textContent = store.getCartCount();
      badge.classList.add('scale-125');
      setTimeout(() => badge.classList.remove('scale-125'), 200);
    }
  }

  updateWishlistBadge() {
    const badge = document.getElementById('wishlist-badge');
    if (badge) {
      const count = store.wishlist.length;
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  // ----------------------------------------------------
  // Main Router View Renderer
  // ----------------------------------------------------
  renderCurrentView() {
    const main = document.getElementById('main-content');
    if (!main) return;

    // Clean up hero animations if leaving home
    if (this.currentView !== 'home' && this.heroAnimationFrame) {
      cancelAnimationFrame(this.heroAnimationFrame);
      this.heroAnimationFrame = null;
    }

    switch (this.currentView) {
      case 'home':
        this.renderHomeView(main);
        break;
      case 'shop':
        this.renderShopView(main);
        break;
      case 'product-detail':
        this.renderProductDetailView(main);
        break;
      case 'about':
        this.renderAboutView(main);
        break;
      case 'contact':
        this.renderContactView(main);
        break;
      case 'admin':
        this.renderAdminView(main);
        break;
      default:
        this.renderHomeView(main);
    }

    this.refreshIcons();
  }

  // ----------------------------------------------------
  // Hero Split-World Animated Effects
  // ----------------------------------------------------
  initHeroAnimations() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    // 1. Create twinkling stars
    const starsContainer = document.getElementById('hero-stars');
    if (starsContainer) {
      for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'star-twinkle';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 70}%`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.width = `${2 + Math.random() * 3}px`;
        star.style.height = star.style.width;
        starsContainer.appendChild(star);
      }
    }

    // 2. Create princess-side floating sparkles (left 40% of screen)
    const sparklesContainer = document.getElementById('hero-sparkles');
    if (sparklesContainer) {
      const sparkleColors = ['#FF69B4', '#FFD700', '#FF6EC7', '#FFC0CB', '#FF85C8', '#FFDAB9'];
      for (let i = 0; i < 18; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.style.left = `${5 + Math.random() * 35}%`;
        sparkle.style.top = `${30 + Math.random() * 50}%`;
        sparkle.style.background = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        sparkle.style.animationDuration = `${3 + Math.random() * 4}s`;
        sparkle.style.animationDelay = `${Math.random() * 5}s`;
        sparkle.style.width = `${4 + Math.random() * 5}px`;
        sparkle.style.height = sparkle.style.width;
        sparklesContainer.appendChild(sparkle);
      }
    }

    // 3. Create drift-side smoke particles (right 40% of screen)
    const smokeContainer = document.getElementById('hero-smoke');
    if (smokeContainer) {
      for (let i = 0; i < 10; i++) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.style.right = `${5 + Math.random() * 30}%`;
        smoke.style.top = `${45 + Math.random() * 30}%`;
        smoke.style.width = `${30 + Math.random() * 60}px`;
        smoke.style.height = smoke.style.width;
        smoke.style.animationDuration = `${4 + Math.random() * 3}s`;
        smoke.style.animationDelay = `${Math.random() * 4}s`;
        smokeContainer.appendChild(smoke);
      }
    }

    // 4. Mouse parallax effect on hero background
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroBg.style.transform = `translate(${x * -15}px, ${y * -10}px) scale(1.05)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        heroBg.style.transform = 'translate(0, 0) scale(1.05)';
      });
    }

    // 5. Scroll-based parallax fade
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      if (scrollY < heroHeight) {
        const progress = scrollY / heroHeight;
        heroSection.style.opacity = 1 - progress * 0.5;
        if (heroBg) {
          heroBg.style.filter = `brightness(${1 - progress * 0.3})`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    this._heroScrollHandler = handleScroll;
  }

  // ----------------------------------------------------
  // 1. Home Page View
  // ----------------------------------------------------
  renderHomeView(container) {
    const products = store.getProducts();
    const featured = products.slice(0, 4);

    container.innerHTML = `
      <!-- Hero Section: Split-World Universe -->
      <section class="hero-universe" id="hero-section">
        <!-- Reference image background -->
        <div class="hero-bg-image parallax-layer" id="hero-bg"></div>

        <!-- Animated star field -->
        <div id="hero-stars" class="absolute inset-0 z-[2] pointer-events-none"></div>

        <!-- Princess side sparkles container -->
        <div id="hero-sparkles" class="absolute inset-0 z-[5] pointer-events-none"></div>

        <!-- Drift side smoke container -->
        <div id="hero-smoke" class="absolute inset-0 z-[5] pointer-events-none"></div>

        <!-- Neon glow orbs (drift side) -->
        <div class="neon-glow" style="right:15%;top:30%;width:200px;height:200px;background:rgba(56,189,248,0.25);"></div>
        <div class="neon-glow" style="right:25%;top:55%;width:150px;height:150px;background:rgba(147,51,234,0.2);animation-delay:-1.5s;"></div>
        <div class="neon-glow" style="right:10%;bottom:20%;width:120px;height:120px;background:rgba(255,110,64,0.18);animation-delay:-0.8s;"></div>

        <!-- Princess side glow orbs -->
        <div class="neon-glow" style="left:8%;top:25%;width:180px;height:180px;background:rgba(255,105,180,0.2);animation-delay:-0.5s;"></div>
        <div class="neon-glow" style="left:20%;top:50%;width:140px;height:140px;background:rgba(255,215,0,0.15);animation-delay:-2s;"></div>

        <!-- Hero Content Overlay -->
        <div class="relative z-10 flex flex-col justify-center min-h-[100vh] px-4 sm:px-8 lg:px-16">
          <div class="max-w-7xl mx-auto w-full pt-20 pb-16">
            
            <!-- Headline -->
            <h1 class="hero-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display text-white tracking-tight leading-[1.1] max-w-2xl drop-shadow-lg">
              Every Toy<br/>Has Its Own<br/><span class="shimmer-text">Universe</span>
            </h1>

            <!-- Subtext -->
            <p class="hero-fade-up hero-fade-up-d1 mt-5 text-sm sm:text-base md:text-lg text-white/80 font-medium max-w-lg leading-relaxed drop-shadow-md">
              From sparkling dream dolls to smoke-trailing drift racers, discover a world made for every kind of imagination.
            </p>

            <!-- CTA Buttons -->
            <div class="hero-fade-up hero-fade-up-d2 mt-8 flex flex-wrap items-center gap-4">
              <a href="#shop" id="btn-explore-magic" class="btn-magic inline-flex items-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full font-extrabold text-sm sm:text-base shadow-lg">
                <span>✨</span>
                <span>Explore the Magic</span>
                <span>›</span>
              </a>
              <a href="#shop" id="btn-discover-drift" class="btn-drift inline-flex items-center gap-3 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full font-extrabold text-sm sm:text-base shadow-lg">
                <span>🏎️</span>
                <span>Discover Drift</span>
                <span>›</span>
              </a>
            </div>

            <!-- Scroll hint -->
            <div class="hero-fade-up hero-fade-up-d4 mt-12 flex items-center gap-2 text-white/50 text-xs font-bold">
              <i data-lucide="mouse" class="w-4 h-4"></i>
              <span>Scroll to explore more wonders</span>
            </div>

          </div>
        </div>
      </section>

      <!-- Whimsical Categories Section -->
      <section class="py-14 bg-white/60 border-y border-amber-200/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-10">
            <span class="px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-extrabold uppercase tracking-wider">Play Worlds</span>
            <h2 class="text-3xl sm:text-4xl font-black font-display text-amber-950 mt-3">Choose Your Play Adventure</h2>
            <p class="text-stone-600 font-medium text-sm sm:text-base mt-2">Every child's imagination is unique. Explore our curated kingdoms of play.</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            ${CATEGORIES.map(cat => `
              <button class="cat-pill-btn group p-4 rounded-3xl bg-gradient-to-b from-white to-amber-50/60 border-2 border-amber-200/60 hover:border-orange-400 shadow-toy toy-card-lift text-center flex flex-col items-center transition-all" data-category="${cat.id}">
                <div class="w-14 h-14 rounded-2xl bg-amber-100/80 group-hover:bg-orange-400 group-hover:text-white flex items-center justify-center text-amber-700 transition-all duration-300 mb-3 shadow-inner">
                  <i data-lucide="${cat.icon}" class="w-7 h-7"></i>
                </div>
                <span class="font-extrabold text-sm text-stone-800 group-hover:text-orange-600 transition-colors">${cat.label}</span>
                <span class="text-[11px] font-bold text-stone-400 mt-1">${cat.count ? cat.count + ' wonders' : 'All'}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Interactive Magical Gift Finder / Quiz Section -->
      <section class="py-14 bg-amber-100/40">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-400 p-8 sm:p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4">
                <span>🪄 Magic Toy Matchmaker</span>
              </div>
              <h3 class="text-3xl font-black font-display text-white">Find the Perfect Toy in 2 Clicks</h3>
              <p class="text-white/90 text-sm sm:text-base mt-2 font-medium">Not sure what to choose? Select the age group and let the magic find the right toy!</p>
              
              <div class="mt-6 flex flex-wrap gap-3">
                <button class="quiz-age-btn px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-orange-600 font-extrabold text-xs sm:text-sm backdrop-blur transition-all" data-age="0-3">
                  👶 0-3 Years (Toddler)
                </button>
                <button class="quiz-age-btn px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-orange-600 font-extrabold text-xs sm:text-sm backdrop-blur transition-all" data-age="3-6">
                  🧒 3-6 Years (Preschool)
                </button>
                <button class="quiz-age-btn px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-orange-600 font-extrabold text-xs sm:text-sm backdrop-blur transition-all" data-age="6+">
                  🚀 6+ Years (Adventurers)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Toys Showcase Grid -->
      <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span class="px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase tracking-wider">Handcrafted Treasures</span>
            <h2 class="text-3xl sm:text-4xl font-black font-display text-amber-950 mt-3">Featured Wonder Toys</h2>
            <p class="text-stone-600 font-medium text-sm sm:text-base mt-1">Our most beloved toys, celebrated by children and certified by parents.</p>
          </div>
          <a href="#shop" class="btn-bubbly inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 font-extrabold text-sm hover:border-orange-400 hover:text-orange-600 shadow-sm transition-all self-start sm:self-auto">
            <span>Explore All Toys</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${featured.map(toy => this.renderProductCardHTML(toy)).join('')}
        </div>
      </section>

      <!-- The Toymaker's Workshop Promise Banner -->
      <section class="py-16 bg-white/80 border-t border-amber-200/60">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">The Wonder Guarantee</span>
            <h2 class="text-3xl sm:text-4xl font-black font-display text-amber-950 mt-3">Why Families Trust Our Toys</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 text-center">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mb-4 shadow-sm">
                🛡️
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">100% Certified Safe</h4>
              <p class="text-stone-600 text-xs mt-2 font-medium">BPA-free, non-toxic organic dyes, and splinter-free velvety beechwood.</p>
            </div>

            <div class="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 text-center">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-4 shadow-sm">
                🌱
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Screen-Free Joy</h4>
              <p class="text-stone-600 text-xs mt-2 font-medium">Tactile, open-ended wonder that cultivates patience, creativity and focus.</p>
            </div>

            <div class="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 text-center">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl mb-4 shadow-sm">
                🎁
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Free Gift Wrapping</h4>
              <p class="text-stone-600 text-xs mt-2 font-medium">Every order arrives in whimsical patterned paper with a handwritten ribbon tag.</p>
            </div>

            <div class="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 text-center">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl mb-4 shadow-sm">
                💬
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Direct WhatsApp Help</h4>
              <p class="text-stone-600 text-xs mt-2 font-medium">Have questions or want custom toy advice? Chat with our friendly toymaker instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Whimsical Testimonials -->
      <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <span class="px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wider">Smiles from the Playroom</span>
          <h2 class="text-3xl sm:text-4xl font-black font-display text-amber-950 mt-3">Loved by Children & Parents</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 rounded-3xl bg-white border border-amber-200 shadow-toy">
            <div class="flex text-amber-400 mb-3 text-lg">★★★★★</div>
            <p class="text-stone-700 font-medium text-sm italic">"The Wooden Grand Prix Racer is my 4-year-old son's favorite possession. The wheels are whisper-silent on hardwood floors, and the craftsmanship is heirloom-level!"</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">SL</div>
              <div>
                <div class="font-extrabold text-sm text-stone-900">Sarah & Leo (Age 4)</div>
                <div class="text-[11px] text-stone-500">Verified Parent, Oregon</div>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-white border border-amber-200 shadow-toy">
            <div class="flex text-amber-400 mb-3 text-lg">★★★★★</div>
            <p class="text-stone-700 font-medium text-sm italic">"Barnaby the Honey Bear smells clean, feels unimaginably soft, and has survived two spin cycles with zero lint or fading. Worth every single penny."</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">MR</div>
              <div>
                <div class="font-extrabold text-sm text-stone-900">Marcus R.</div>
                <div class="text-[11px] text-stone-500">Verified Parent, Austin</div>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-white border border-amber-200 shadow-toy">
            <div class="flex text-amber-400 mb-3 text-lg">★★★★★</div>
            <p class="text-stone-700 font-medium text-sm italic">"The Rainbow Stacking Arch opened up hours of pretend bridges and marble runs. It's so rare to find toys that are both stunning on display and thrilling to play with."</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">ET</div>
              <div>
                <div class="font-extrabold text-sm text-stone-900">Elena & Maya (Age 3)</div>
                <div class="text-[11px] text-stone-500">Montessori Educator</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Initialize split-world hero animations
    this.initHeroAnimations();

    // CTA button sounds
    document.getElementById('btn-explore-magic')?.addEventListener('click', () => {
      sounds.playMagicChime();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 60,
          spread: 80,
          colors: ['#FF69B4', '#FFD700', '#FF6EC7', '#FFC0CB', '#FFFFFF'],
          origin: { y: 0.7 }
        });
      }
    });
    document.getElementById('btn-discover-drift')?.addEventListener('click', () => {
      sounds.playDrift();
    });

    // Category pill clicks
    document.querySelectorAll('.cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sounds.playPop();
        const cat = btn.getAttribute('data-category');
        this.activeCategory = cat;
        window.location.hash = 'shop';
      });
    });

    // Quiz age buttons
    document.querySelectorAll('.quiz-age-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sounds.playSparkle();
        const age = btn.getAttribute('data-age');
        this.activeAge = age;
        window.location.hash = 'shop';
      });
    });

    this.bindProductCardEvents();
  }

  // ----------------------------------------------------
  // 2. Shop Page View
  // ----------------------------------------------------
  renderShopView(container) {
    const products = store.getProducts();

    // Filter by Category
    let filtered = products;
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }

    // Filter by Age
    if (this.activeAge !== 'all') {
      filtered = filtered.filter(p => {
        if (this.activeAge === '0-3') return p.ageRange.includes('0-') || p.ageRange.includes('1-') || p.ageRange.includes('2-');
        if (this.activeAge === '3-6') return p.ageRange.includes('2-') || p.ageRange.includes('3-') || p.ageRange.includes('1-6');
        if (this.activeAge === '6+') return p.ageRange.includes('6-') || p.ageRange.includes('4-10') || p.ageRange.includes('3-12');
        return true;
      });
    }

    // Filter by Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by Max Price
    filtered = filtered.filter(p => p.price <= this.maxPrice);

    // Sort Options
    if (this.sortOption === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.sortOption === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (this.sortOption === 'alpha') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Shop Header Title -->
        <div class="mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span class="px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-extrabold uppercase tracking-wider">Toy Catalog</span>
              <h1 class="text-3xl sm:text-4xl font-black font-display text-amber-950 mt-2">The Wonder Toy Shop</h1>
              <p class="text-stone-600 text-sm font-medium mt-1">Showing <span class="font-black text-orange-600">${filtered.length}</span> handcrafted toys</p>
            </div>

            <!-- Search Bar -->
            <div class="relative w-full md:w-80">
              <input
                id="shop-search-input"
                type="text"
                placeholder="Search toys (e.g. bear, blocks, car)..."
                value="${this.searchQuery}"
                class="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border-2 border-amber-200 focus:border-orange-500 focus:outline-none text-stone-800 text-sm font-medium shadow-sm transition-all"
              />
              <i data-lucide="search" class="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5"></i>
              ${this.searchQuery ? `
                <button id="clear-search-btn" class="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Filters Bar: Category, Age, Price, Sort -->
        <div class="bg-white p-5 rounded-3xl border border-amber-200 shadow-toy mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          <!-- Category Chips -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            ${CATEGORIES.map(cat => `
              <button class="shop-filter-cat whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${this.activeCategory === cat.id ? 'bg-orange-500 text-white shadow-md' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}" data-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>

          <!-- Secondary Filters: Age & Sort -->
          <div class="flex items-center flex-wrap gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
            <!-- Age Filter Select -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-stone-500">Age:</span>
              <select id="shop-age-select" class="bg-stone-100 font-extrabold text-xs text-stone-700 rounded-xl px-3 py-2 border-0 focus:ring-2 focus:ring-orange-400">
                ${AGE_RANGES.map(age => `
                  <option value="${age.id}" ${this.activeAge === age.id ? 'selected' : ''}>${age.label}</option>
                `).join('')}
              </select>
            </div>

            <!-- Sort By Select -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-stone-500">Sort:</span>
              <select id="shop-sort-select" class="bg-stone-100 font-extrabold text-xs text-stone-700 rounded-xl px-3 py-2 border-0 focus:ring-2 focus:ring-orange-400">
                <option value="featured" ${this.sortOption === 'featured' ? 'selected' : ''}>Featured</option>
                <option value="price-low" ${this.sortOption === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-high" ${this.sortOption === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating" ${this.sortOption === 'rating' ? 'selected' : ''}>Highest Rated</option>
                <option value="alpha" ${this.sortOption === 'alpha' ? 'selected' : ''}>Alphabetical</option>
              </select>
            </div>

            <!-- Active Filters Reset if modified -->
            ${(this.activeCategory !== 'all' || this.activeAge !== 'all' || this.searchQuery) ? `
              <button id="reset-all-filters" class="text-xs font-extrabold text-orange-600 hover:text-orange-700 underline px-2 py-1">
                Reset Filters
              </button>
            ` : ''}
          </div>

        </div>

        <!-- Product Grid -->
        ${filtered.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${filtered.map(toy => this.renderProductCardHTML(toy)).join('')}
          </div>
        ` : `
          <div class="text-center py-20 bg-white rounded-3xl border border-amber-200 shadow-sm max-w-md mx-auto">
            <span class="text-6xl">🔍🧸</span>
            <h3 class="text-xl font-black font-display text-amber-950 mt-4">No Wonder Toys Found</h3>
            <p class="text-stone-500 text-sm mt-2">Try clearing your search query or selecting a different category.</p>
            <button id="empty-reset-btn" class="mt-6 px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-extrabold text-sm shadow hover:bg-orange-600">
              Clear All Filters
            </button>
          </div>
        `}

      </div>
    `;

    // Search input listener
    const searchInput = document.getElementById('shop-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderShopView(container);
      this.refreshIcons();
    });

    document.getElementById('clear-search-btn')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.renderShopView(container);
      this.refreshIcons();
    });

    // Category chips
    document.querySelectorAll('.shop-filter-cat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sounds.playPop();
        this.activeCategory = btn.getAttribute('data-cat');
        this.renderShopView(container);
        this.refreshIcons();
      });
    });

    // Age select
    document.getElementById('shop-age-select')?.addEventListener('change', (e) => {
      sounds.playPop();
      this.activeAge = e.target.value;
      this.renderShopView(container);
      this.refreshIcons();
    });

    // Sort select
    document.getElementById('shop-sort-select')?.addEventListener('change', (e) => {
      sounds.playPop();
      this.sortOption = e.target.value;
      this.renderShopView(container);
      this.refreshIcons();
    });

    // Reset buttons
    const resetFn = () => {
      sounds.playPop();
      this.activeCategory = 'all';
      this.activeAge = 'all';
      this.searchQuery = '';
      this.sortOption = 'featured';
      this.renderShopView(container);
      this.refreshIcons();
    };
    document.getElementById('reset-all-filters')?.addEventListener('click', resetFn);
    document.getElementById('empty-reset-btn')?.addEventListener('click', resetFn);

    this.bindProductCardEvents();
  }

  // ----------------------------------------------------
  // Product Card Template
  // ----------------------------------------------------
  renderProductCardHTML(toy) {
    const isWish = store.isInWishlist(toy.id);

    return `
      <div class="toy-card group relative bg-white rounded-3xl p-4 border border-amber-200/80 shadow-toy toy-card-lift flex flex-col justify-between transition-all" data-id="${toy.id}">
        
        <!-- Top Image Container -->
        <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-amber-50/70 mb-3.5">
          <!-- Main Product Image -->
          <img
            src="${toy.image}"
            alt="${toy.name}"
            loading="lazy"
            class="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          />

          <!-- Badge tag -->
          ${toy.badge ? `
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md ${toy.badgeColor || 'bg-amber-400 text-amber-950'}">
              ${toy.badge}
            </span>
          ` : ''}

          <!-- Wishlist Heart Button -->
          <button class="wishlist-toggle-btn absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-400 hover:text-rose-500 shadow-sm transition-all ${isWish ? 'text-rose-500 bg-white' : ''}" data-id="${toy.id}" title="Save to Wishlist">
            <i data-lucide="heart" class="w-4 h-4 ${isWish ? 'fill-rose-500' : ''}"></i>
          </button>

          <!-- Quick View Hover Button -->
          <button class="quick-view-btn absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/95 text-stone-900 font-extrabold text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:text-white flex items-center gap-1.5" data-id="${toy.id}">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>Quick View</span>
          </button>
        </div>

        <!-- Details Info -->
        <div class="flex-1 flex flex-col">
          <div class="flex items-center justify-between text-xs text-stone-400 font-bold mb-1">
            <span>${toy.categoryLabel}</span>
            <span class="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px]">${toy.ageRange}</span>
          </div>

          <h3 class="font-extrabold font-display text-base text-amber-950 line-clamp-1 group-hover:text-orange-600 transition-colors">
            <a href="#product/${toy.id}">${toy.name}</a>
          </h3>

          <p class="text-xs text-stone-500 font-medium line-clamp-2 mt-1 mb-3">
            ${toy.tagline}
          </p>

          <!-- Rating Stars -->
          <div class="flex items-center gap-1 mb-3">
            <div class="flex text-amber-400 text-xs">★★★★★</div>
            <span class="text-xs font-black text-stone-800">${toy.rating}</span>
            <span class="text-[11px] text-stone-400">(${toy.reviewsCount})</span>
          </div>
        </div>

        <!-- Price & Add To Cart Button -->
        <div class="pt-3 border-t border-amber-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-lg font-black font-display text-amber-950">$${toy.price.toFixed(2)}</span>
              ${toy.originalPrice ? `
                <span class="text-xs text-stone-400 line-through">$${toy.originalPrice.toFixed(2)}</span>
              ` : ''}
            </div>
            <span class="text-[10px] font-bold text-emerald-600">In Stock</span>
          </div>

          <button class="add-to-cart-btn btn-bubbly p-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all" data-id="${toy.id}" title="Add to Cart">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
          </button>
        </div>

      </div>
    `;
  }

  bindProductCardEvents() {
    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        store.addToCart(id, 1);
        sounds.playSparkle();

        // Confetti burst from button position
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 20,
            spread: 50,
            origin: { y: 0.7 }
          });
        }

        const prod = store.getProductById(id);
        this.showToast(`Added "${prod?.name || 'Toy'}" to your cart! 🛍️`, 'success');
      });
    });

    // Wishlist Toggle Buttons
    document.querySelectorAll('.wishlist-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const added = store.toggleWishlist(id);
        sounds.playPop();

        const prod = store.getProductById(id);
        this.showToast(added ? `Saved "${prod?.name}" to favorites! ❤️` : `Removed from favorites.`, 'info');
      });
    });

    // Quick View Modal triggers
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const prod = store.getProductById(id);
        if (prod) {
          sounds.playPop();
          this.openProductModal(prod);
        }
      });
    });

    this.refreshIcons();
  }

  // ----------------------------------------------------
  // 3. Product Details Modal / Dedicated Page View
  // ----------------------------------------------------
  renderProductDetailView(container) {
    const toy = this.selectedProduct;
    if (!toy) {
      this.navigate('shop');
      return;
    }

    const isWish = store.isInWishlist(toy.id);
    const related = store.getProducts().filter(p => p.category === toy.category && p.id !== toy.id).slice(0, 3);
    const whatsAppUrl = store.generateWhatsAppOrderUrl('', `Hello! I would love to inquire about availability for ${toy.name} ($${toy.price.toFixed(2)})`);

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center gap-2 text-xs font-bold text-stone-500 mb-6">
          <a href="#home" class="hover:text-orange-600">Home</a>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          <a href="#shop" class="hover:text-orange-600">Shop</a>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          <span class="text-orange-600">${toy.name}</span>
        </nav>

        <!-- Main Product Stage -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-[2.5rem] border border-amber-200 shadow-toy">
          
          <!-- Left: High-Res Gallery -->
          <div class="lg:col-span-6 flex flex-col gap-4">
            <div class="relative w-full aspect-square rounded-3xl overflow-hidden bg-amber-50/80 border border-amber-200/60 shadow-inner">
              <img
                id="detail-main-img"
                src="${toy.image}"
                alt="${toy.name}"
                class="w-full h-full object-cover object-center transition-all duration-300"
              />
              ${toy.badge ? `
                <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase shadow ${toy.badgeColor || 'bg-amber-400 text-amber-950'}">
                  ${toy.badge}
                </span>
              ` : ''}
            </div>

            <!-- Additional Image Thumbnails if present -->
            ${toy.additionalImages && toy.additionalImages.length > 1 ? `
              <div class="flex items-center gap-3">
                ${toy.additionalImages.map((img, idx) => `
                  <button class="thumb-btn w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-orange-500 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'}" data-src="${img}">
                    <img src="${img}" class="w-full h-full object-cover" />
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Right: Details, Purchase Controls & Story -->
          <div class="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-4 mb-2">
                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider">${toy.categoryLabel}</span>
                <span class="text-xs font-extrabold text-stone-500">Ages: <strong class="text-stone-800">${toy.ageRange}</strong></span>
              </div>

              <h1 class="text-3xl sm:text-4xl font-black font-display text-amber-950 leading-tight">
                ${toy.name}
              </h1>

              <p class="text-stone-600 font-medium text-base mt-2">
                ${toy.tagline}
              </p>

              <!-- Star Rating -->
              <div class="mt-4 flex items-center gap-2">
                <div class="flex text-amber-400 text-sm">★★★★★</div>
                <span class="text-sm font-black text-stone-900">${toy.rating}</span>
                <span class="text-xs text-stone-500">(${toy.reviewsCount} verified reviews)</span>
                <span class="text-stone-300">|</span>
                <span class="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                  ${toy.inStock ? `In Stock (${toy.stockCount || 10} ready to ship)` : 'Backorder'}
                </span>
              </div>

              <!-- Price Display -->
              <div class="mt-6 flex items-baseline gap-3">
                <span class="text-3xl font-black font-display text-amber-950">$${toy.price.toFixed(2)}</span>
                ${toy.originalPrice ? `
                  <span class="text-base text-stone-400 line-through">$${toy.originalPrice.toFixed(2)}</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold">Save $${(toy.originalPrice - toy.price).toFixed(2)}</span>
                ` : ''}
              </div>

              <!-- Story Description -->
              <div class="mt-6 text-stone-700 text-sm sm:text-base leading-relaxed">
                ${toy.description}
              </div>

              <!-- Key Features -->
              ${toy.features && toy.features.length ? `
                <div class="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h4 class="font-black font-display text-xs text-amber-950 uppercase tracking-wider mb-2">Toy Wonder Features:</h4>
                  <ul class="space-y-1.5 text-xs text-stone-700 font-medium">
                    ${toy.features.map(f => `
                      <li class="flex items-start gap-2">
                        <span class="text-orange-500 font-bold">✓</span>
                        <span>${f}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>

            <!-- Action Controls: Quantity, Add To Cart, WhatsApp -->
            <div class="mt-8 pt-6 border-t border-amber-200">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                
                <!-- Quantity Picker -->
                <div class="flex items-center justify-between bg-stone-100 rounded-2xl p-1.5 w-full sm:w-36 border border-stone-200">
                  <button id="detail-qty-minus" class="w-9 h-9 rounded-xl bg-white shadow-sm font-black text-stone-700 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                    -
                  </button>
                  <span id="detail-qty-value" class="font-black text-base text-stone-900 px-3">1</span>
                  <button id="detail-qty-plus" class="w-9 h-9 rounded-xl bg-white shadow-sm font-black text-stone-700 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                    +
                  </button>
                </div>

                <!-- Add To Cart Button -->
                <button id="detail-add-cart-btn" class="btn-bubbly flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-base shadow-xl hover:shadow-orange-400/30 flex items-center justify-center gap-2">
                  <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                  <span>Add to Wonder Cart</span>
                </button>

                <!-- Wishlist Toggle -->
                <button id="detail-wishlist-btn" class="p-4 rounded-2xl border border-stone-200 hover:border-rose-400 text-stone-500 hover:text-rose-500 transition-all ${isWish ? 'text-rose-500 bg-rose-50 border-rose-200' : ''}" title="Save to Wishlist">
                  <i data-lucide="heart" class="w-5 h-5 ${isWish ? 'fill-rose-500' : ''}"></i>
                </button>
              </div>

              <!-- Instant WhatsApp Order Button -->
              <div class="mt-4">
                <a href="${whatsAppUrl}" target="_blank" class="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all">
                  <span>💬 Enquire & Order via WhatsApp</span>
                </a>
              </div>

              <!-- Safety Specs -->
              <div class="mt-6 grid grid-cols-2 gap-3 text-xs text-stone-500 border-t border-stone-100 pt-4">
                <div><strong>Materials:</strong> ${toy.materials || 'Sustainable non-toxic beechwood & organic fabrics'}</div>
                <div><strong>Safety:</strong> ${toy.safety || 'ASTM F963 & EN71 compliant. Child-safe glaze.'}</div>
              </div>
            </div>

          </div>
        </div>

        <!-- Related Toys -->
        ${related.length ? `
          <div class="mt-16">
            <h3 class="text-2xl font-black font-display text-amber-950 mb-6">More Treasures You May Love</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              ${related.map(r => this.renderProductCardHTML(r)).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    // Quantity selector logic
    let qty = 1;
    const qtyValue = document.getElementById('detail-qty-value');
    document.getElementById('detail-qty-minus')?.addEventListener('click', () => {
      sounds.playPop();
      if (qty > 1) {
        qty--;
        if (qtyValue) qtyValue.textContent = qty;
      }
    });
    document.getElementById('detail-qty-plus')?.addEventListener('click', () => {
      sounds.playPop();
      qty++;
      if (qtyValue) qtyValue.textContent = qty;
    });

    // Add to Cart
    document.getElementById('detail-add-cart-btn')?.addEventListener('click', () => {
      store.addToCart(toy.id, qty);
      sounds.playSparkle();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      }
      this.showToast(`Added ${qty}x "${toy.name}" to cart! 🛍️`, 'success');
      this.toggleCartDrawer(true);
    });

    // Wishlist
    document.getElementById('detail-wishlist-btn')?.addEventListener('click', () => {
      const added = store.toggleWishlist(toy.id);
      sounds.playPop();
      this.showToast(added ? `Saved to favorites! ❤️` : `Removed from favorites.`, 'info');
      this.renderProductDetailView(container);
    });

    // Thumbnails
    document.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playPop();
        const src = btn.getAttribute('data-src');
        const mainImg = document.getElementById('detail-main-img');
        if (mainImg) mainImg.src = src;
      });
    });

    this.bindProductCardEvents();
  }

  // Quick View Modal
  openProductModal(toy) {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white max-w-2xl w-full rounded-[2.5rem] border border-amber-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
          <!-- Close Button -->
          <button id="modal-close-btn" class="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div class="rounded-3xl overflow-hidden bg-amber-50 aspect-square">
              <img src="${toy.image}" class="w-full h-full object-cover" />
            </div>
            <div>
              <span class="text-xs font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full">${toy.categoryLabel}</span>
              <h3 class="text-2xl font-black font-display text-amber-950 mt-2">${toy.name}</h3>
              <p class="text-stone-500 text-xs mt-1">${toy.tagline}</p>
              
              <div class="mt-4 flex items-baseline gap-2">
                <span class="text-2xl font-black font-display text-amber-950">$${toy.price.toFixed(2)}</span>
                ${toy.originalPrice ? `<span class="text-xs text-stone-400 line-through">$${toy.originalPrice.toFixed(2)}</span>` : ''}
              </div>

              <p class="mt-3 text-stone-600 text-xs leading-relaxed line-clamp-3">${toy.description}</p>

              <div class="mt-6 flex items-center gap-3">
                <button id="modal-add-cart" class="btn-bubbly flex-1 py-3 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow">
                  Add to Cart
                </button>
                <a href="#product/${toy.id}" id="modal-view-full" class="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs">
                  Full Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-close-btn')?.addEventListener('click', () => {
      sounds.playSwoosh();
      modal.innerHTML = '';
    });

    document.getElementById('modal-add-cart')?.addEventListener('click', () => {
      store.addToCart(toy.id, 1);
      sounds.playSparkle();
      modal.innerHTML = '';
      this.showToast(`Added "${toy.name}" to cart! 🛍️`, 'success');
      this.toggleCartDrawer(true);
    });

    document.getElementById('modal-view-full')?.addEventListener('click', () => {
      modal.innerHTML = '';
    });

    this.refreshIcons();
  }

  // ----------------------------------------------------
  // 4. Shopping Cart Drawer & Checkout Experience
  // ----------------------------------------------------
  renderCartDrawer() {
    let drawer = document.getElementById('cart-drawer-container');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'cart-drawer-container';
      document.body.appendChild(drawer);
    }

    drawer.innerHTML = `
      <div id="cart-drawer-backdrop" class="fixed inset-0 bg-stone-950/50 backdrop-blur-xs z-50 transition-opacity duration-300 opacity-0 pointer-events-none">
        <div id="cart-drawer-panel" class="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-out border-l border-amber-200">
          
          <!-- Drawer Header -->
          <div class="p-5 border-b border-amber-200/70 flex items-center justify-between bg-amber-50/60">
            <div class="flex items-center gap-2.5">
              <img src="assets/toyxima-elephant.png" alt="Toyxima" class="w-8 h-8 object-contain" />
              <h3 class="font-black font-display text-lg text-amber-950">Toyxima Cart</h3>
              <span id="cart-drawer-count" class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
                ${store.getCartCount()}
              </span>
            </div>
            <button id="close-cart-drawer-btn" class="w-8 h-8 rounded-full bg-white hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-all">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Free Shipping Progress Meter -->
          <div id="cart-shipping-meter" class="px-5 py-3 bg-amber-100/50 border-b border-amber-200/60">
            <!-- Dynamic content injected -->
          </div>

          <!-- Cart Items Scrollable Container -->
          <div id="cart-items-list" class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- Dynamic items injected -->
          </div>

          <!-- Drawer Footer: Gift Wrap, Promo, Totals & Checkout -->
          <div id="cart-drawer-footer" class="p-5 border-t border-amber-200 bg-amber-50/40 space-y-3.5">
            <!-- Dynamic footer injected -->
          </div>

        </div>
      </div>
    `;

    document.getElementById('close-cart-drawer-btn')?.addEventListener('click', () => {
      sounds.playSwoosh();
      this.toggleCartDrawer(false);
    });

    document.getElementById('cart-drawer-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'cart-drawer-backdrop') {
        sounds.playSwoosh();
        this.toggleCartDrawer(false);
      }
    });

    this.renderCartDrawerContent();
  }

  toggleCartDrawer(open) {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    const panel = document.getElementById('cart-drawer-panel');
    if (!backdrop || !panel) return;

    if (open) {
      this.renderCartDrawerContent();
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
    } else {
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      panel.classList.add('translate-x-full');
      panel.classList.remove('translate-x-0');
    }
    this.refreshIcons();
  }

  renderCartDrawerContent() {
    const list = document.getElementById('cart-items-list');
    const footer = document.getElementById('cart-drawer-footer');
    const countBadge = document.getElementById('cart-drawer-count');
    const meter = document.getElementById('cart-shipping-meter');
    if (!list || !footer) return;

    const cart = store.getCart();
    const totals = store.getCartTotals();

    if (countBadge) countBadge.textContent = store.getCartCount();

    // Free Shipping Progress calculation
    if (meter) {
      if (totals.subtotal >= totals.freeShippingThreshold || totals.subtotal === 0) {
        meter.innerHTML = `
          <div class="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <span>🎉</span>
            <span>You've unlocked <strong>FREE Magic Shipping!</strong></span>
          </div>
          <div class="w-full bg-emerald-200 h-2 rounded-full mt-1.5 overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full w-full"></div>
          </div>
        `;
      } else {
        const pct = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100));
        meter.innerHTML = `
          <div class="flex items-center justify-between text-xs font-bold text-stone-700">
            <span>Add <strong>$${totals.amountNeededForFreeShipping.toFixed(2)}</strong> more for FREE shipping</span>
            <span class="text-orange-600">${pct}%</span>
          </div>
          <div class="w-full bg-amber-200/80 h-2 rounded-full mt-1.5 overflow-hidden">
            <div class="bg-orange-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        `;
      }
    }

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="text-center py-16">
          <img src="assets/toyxima-elephant.png" alt="Toyxima Elephant" class="w-20 h-20 mx-auto object-contain animate-bounce" />
          <h4 class="font-black font-display text-lg text-amber-950 mt-4">Your Cart is Empty</h4>
          <p class="text-stone-500 text-xs mt-1">Discover handcrafted toys ready to spark joy!</p>
          <a href="#shop" class="btn-bubbly mt-5 inline-block px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-extrabold text-xs shadow">
            Browse Toy Shop
          </a>
        </div>
      `;
      footer.innerHTML = ``;
      return;
    }

    // List of items
    list.innerHTML = cart.map(item => `
      <div class="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
        <img src="${item.image}" class="w-16 h-16 rounded-xl object-cover bg-white" />
        <div class="flex-1">
          <h5 class="font-black text-xs text-stone-900 line-clamp-1">${item.name}</h5>
          <span class="text-xs font-black text-amber-950">$${item.price.toFixed(2)}</span>
          
          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-2 py-0.5">
              <button class="cart-qty-btn font-black text-stone-600 hover:text-orange-600 text-xs px-1" data-id="${item.id}" data-action="minus">-</button>
              <span class="font-black text-xs text-stone-800">${item.quantity}</span>
              <button class="cart-qty-btn font-black text-stone-600 hover:text-orange-600 text-xs px-1" data-id="${item.id}" data-action="plus">+</button>
            </div>
            <button class="cart-del-btn text-stone-400 hover:text-rose-500 text-xs" data-id="${item.id}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Footer with Gift Wrap, Promo, Summary, WhatsApp & Checkout
    const whatsAppCartUrl = store.generateWhatsAppOrderUrl();

    footer.innerHTML = `
      <!-- Gift Wrap Option -->
      <label class="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
        <input type="checkbox" id="cart-giftwrap-check" ${totals.giftWrap ? 'checked' : ''} class="rounded border-amber-300 text-orange-600 focus:ring-orange-400" />
        <span>🎁 Add Whimsical Gift Wrapping (+ $3.99)</span>
      </label>

      <!-- Promo Code Box -->
      <div class="flex items-center gap-2">
        <input
          id="cart-promo-input"
          type="text"
          placeholder="Promo code (e.g. MAGIC10)"
          value="${totals.promoCode || ''}"
          class="flex-1 px-3 py-1.5 rounded-xl text-xs border border-stone-200 focus:outline-none focus:border-orange-500 uppercase font-bold"
        />
        <button id="cart-promo-btn" class="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs">
          Apply
        </button>
      </div>

      <!-- Cost Breakdown -->
      <div class="space-y-1 text-xs text-stone-600 pt-2 border-t border-amber-200">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <span class="font-bold text-stone-900">$${totals.subtotal.toFixed(2)}</span>
        </div>
        ${totals.discount > 0 ? `
          <div class="flex justify-between text-emerald-600 font-bold">
            <span>Discount (${totals.promoCode}):</span>
            <span>-$${totals.discount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${totals.giftWrap ? `
          <div class="flex justify-between text-amber-800">
            <span>Gift Wrapping:</span>
            <span>+$${totals.giftWrapCost.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="flex justify-between">
          <span>Shipping:</span>
          <span class="font-bold ${totals.shipping === 0 ? 'text-emerald-600' : 'text-stone-900'}">
            ${totals.shipping === 0 ? 'FREE ✨' : '$' + totals.shipping.toFixed(2)}
          </span>
        </div>
        <div class="flex justify-between text-base font-black font-display text-amber-950 pt-1 border-t border-stone-200">
          <span>Total:</span>
          <span>$${totals.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 pt-2">
        <!-- Direct WhatsApp Order -->
        <a href="${whatsAppCartUrl}" target="_blank" class="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all">
          <span>💬 Order via WhatsApp (Instant & Free)</span>
        </a>

        <!-- Simulated Demo Checkout -->
        <button id="open-demo-checkout-btn" class="btn-bubbly w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2">
          <span>Proceed to Demo Checkout</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
      
      <p class="text-[10px] text-stone-400 text-center font-medium">Demo mode: WhatsApp order is 100% active. Zero payment credentials needed.</p>
    `;

    // Hook events inside cart
    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playPop();
        const id = btn.getAttribute('data-id');
        const act = btn.getAttribute('data-action');
        const item = store.getCart().find(i => i.id === id);
        if (item) {
          store.updateQuantity(id, act === 'plus' ? item.quantity + 1 : item.quantity - 1);
        }
      });
    });

    document.querySelectorAll('.cart-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playPop();
        const id = btn.getAttribute('data-id');
        store.removeFromCart(id);
      });
    });

    document.getElementById('cart-giftwrap-check')?.addEventListener('change', (e) => {
      sounds.playPop();
      store.setGiftWrap(e.target.checked);
    });

    document.getElementById('cart-promo-btn')?.addEventListener('click', () => {
      const code = document.getElementById('cart-promo-input')?.value;
      const res = store.applyPromoCode(code);
      if (res.success) {
        sounds.playSparkle();
        this.showToast(res.message, 'success');
      } else {
        sounds.playPop();
        this.showToast(res.message, 'warning');
      }
    });

    document.getElementById('open-demo-checkout-btn')?.addEventListener('click', () => {
      sounds.playPop();
      this.toggleCartDrawer(false);
      this.openCheckoutModal();
    });

    this.refreshIcons();
  }

  // Checkout Modal Simulation
  openCheckoutModal() {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;
    const totals = store.getCartTotals();

    modal.innerHTML = `
      <div class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white max-w-lg w-full rounded-[2.5rem] border border-amber-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
          <!-- Close Button -->
          <button id="checkout-close-btn" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          <div class="text-center mb-6">
            <span class="text-4xl">🏰🎁</span>
            <h3 class="text-2xl font-black font-display text-amber-950 mt-2">Demo Toy Checkout</h3>
            <p class="text-stone-500 text-xs mt-1">This is a fully interactive demo. No real credit card or payment required.</p>
          </div>

          <form id="checkout-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Parent / Recipient Name *</label>
              <input required id="cust-name" type="text" placeholder="e.g. Emily Watson" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium" />
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
              <input required id="cust-email" type="email" placeholder="e.g. emily@example.com" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium" />
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Delivery Address *</label>
              <input required id="cust-address" type="text" placeholder="e.g. 124 Blossom Lane, Apt 4" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium" />
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Custom Gift Note (Optional)</label>
              <textarea id="cust-note" rows="2" placeholder="Write a magical wish for the little one..." class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-xs"></textarea>
            </div>

            <!-- Order Total Recap -->
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div class="flex justify-between font-bold text-stone-700">
                <span>Items in order:</span>
                <span>${store.getCartCount()} toys</span>
              </div>
              <div class="flex justify-between font-black text-sm text-amber-950">
                <span>Total Amount:</span>
                <span>$${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" class="btn-bubbly w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-lg hover:shadow-orange-400/30">
              Complete Demo Order ✨
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('checkout-close-btn')?.addEventListener('click', () => {
      sounds.playSwoosh();
      modal.innerHTML = '';
    });

    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const customer = {
        name: document.getElementById('cust-name')?.value,
        email: document.getElementById('cust-email')?.value,
        address: document.getElementById('cust-address')?.value,
        note: document.getElementById('cust-note')?.value
      };

      const order = store.createOrder(customer);
      sounds.playSparkle();

      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      }

      // Show Order Success Screen
      modal.innerHTML = `
        <div class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white max-w-md w-full rounded-[2.5rem] border border-amber-200 shadow-2xl p-8 text-center">
            <span class="text-6xl inline-block animate-bounce">🎉🧸🏰</span>
            <h3 class="text-2xl font-black font-display text-amber-950 mt-4">Order Received!</h3>
            <p class="text-xs text-stone-600 mt-2">Thank you, <strong>${order.customer.name}</strong>! Your toy order reference is <strong class="text-orange-600">${order.id}</strong>.</p>
            <div class="mt-6 p-4 rounded-2xl bg-amber-50 text-left text-xs space-y-1 border border-amber-200">
              <div class="font-bold text-stone-800">Order Summary:</div>
              <div><strong>Items:</strong> ${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</div>
              <div><strong>Total Paid:</strong> $${order.totals.total.toFixed(2)}</div>
              <div><strong>Delivery to:</strong> ${order.customer.address}</div>
            </div>
            <button id="success-done-btn" class="btn-bubbly mt-6 w-full py-3.5 rounded-2xl bg-orange-500 text-white font-extrabold text-sm shadow">
              Back to Toy World
            </button>
          </div>
        </div>
      `;

      document.getElementById('success-done-btn')?.addEventListener('click', () => {
        modal.innerHTML = '';
        this.navigate('shop');
      });

      this.refreshIcons();
    });

    this.refreshIcons();
  }

  // ----------------------------------------------------
  // 5. About Us Page View
  // ----------------------------------------------------
  renderAboutView(container) {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <!-- Header Banner -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider">Our Heart & Heritage</span>
          <h1 class="text-4xl sm:text-5xl font-black font-display text-amber-950 mt-3 leading-tight">
            Crafting Childhood Memories That Last Forever
          </h1>
          <p class="text-stone-600 text-base sm:text-lg font-medium mt-4 leading-relaxed">
            TOYXIMA was born out of a simple belief: children don't need noisy screens to feel wonder — they need thoughtfully designed, tactile treasures that invite them to become authors of their own stories.
          </p>
        </div>

        <!-- Visual Story Split Section -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
          <div class="lg:col-span-6 relative">
            <div class="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80"
                alt="Toy Workshop Craftsman"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Decorative Badge -->
            <div class="absolute -bottom-6 -right-4 bg-white p-4 rounded-3xl shadow-xl border border-amber-200 flex items-center gap-3">
              <span class="text-3xl">🪵</span>
              <div>
                <div class="font-black text-sm text-stone-900">Hand-Sanded Beechwood</div>
                <div class="text-[11px] text-stone-500 font-bold">Safe for baby lips & fingers</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 space-y-6">
            <h2 class="text-3xl font-black font-display text-amber-950">The Toymaker's Journey</h2>
            <p class="text-stone-600 text-base leading-relaxed">
              In 2021, when looking for toys for our own toddlers, we noticed store shelves crowded with fragile plastic gadgets that buzzed, blinked, and broke in three days. We longed for the kind of toys our grandparents passed down: heavy, silky-smooth wooden racers, warm woolly bears, and infinite blocks.
            </p>
            <p class="text-stone-600 text-base leading-relaxed">
              We partnered with artisanal woodturners and ethical textile studios who share our obsession with safety, sustainability, and whimsical wonder. Today, thousands of family living rooms echo with the cheerful clatter of TOYXIMA play.
            </p>

            <div class="pt-4 grid grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div class="text-2xl font-black font-display text-orange-600">Zero Plastic</div>
                <div class="text-xs font-bold text-stone-600 mt-1">In our core toy line & gift wrap</div>
              </div>
              <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div class="text-2xl font-black font-display text-sky-600">Lifetime Love</div>
                <div class="text-xs font-bold text-stone-600 mt-1">Heirloom durability guaranteed</div>
              </div>
            </div>
          </div>
        </div>

        <!-- The Four Pillars -->
        <div class="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-amber-200 shadow-toy mb-20">
          <div class="text-center max-w-xl mx-auto mb-10">
            <h3 class="text-3xl font-black font-display text-amber-950">Our Four Sacred Play Rules</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl mb-4">
                🎨
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Open-Ended Magic</h4>
              <p class="text-stone-600 text-xs mt-2 leading-relaxed">A block isn't just a block; it's a bridge, a telephone, a castle tower, or a dragon's cave.</p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-4">
                🌿
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Planet Kind</h4>
              <p class="text-stone-600 text-xs mt-2 leading-relaxed">For every wooden toy crafted, we plant a new sapling in certified reforestation reserves.</p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl mb-4">
                🔬
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Safety Above All</h4>
              <p class="text-stone-600 text-xs mt-2 leading-relaxed">Rigorous independent drop tests, saliva tests, and chemical screenings for peace of mind.</p>
            </div>

            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mb-4">
                ❤️
              </div>
              <h4 class="font-extrabold font-display text-lg text-amber-950">Heartfelt Care</h4>
              <p class="text-stone-600 text-xs mt-2 leading-relaxed">We treat every customer like a neighbour visiting our neighborhood toy shop.</p>
            </div>
          </div>
        </div>

      </div>
    `;
    this.refreshIcons();
  }

  // ----------------------------------------------------
  // 6. Contact Page View with WhatsApp Inquiry
  // ----------------------------------------------------
  renderContactView(container) {
    const defaultWhatsAppUrl = `https://wa.me/15551238697?text=${encodeURIComponent("Hi TOYXIMA! I'd like to ask a question about your toys.")}`;

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">Toy Concierge</span>
          <h1 class="text-4xl font-black font-display text-amber-950 mt-3">We'd Love to Chat!</h1>
          <p class="text-stone-600 text-base font-medium mt-2">Have a question about toy safety, custom gift wrapping, or order inquiries? Our toy specialists are here for you.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Left: WhatsApp Hero Card & Store Info -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Dedicated WhatsApp Card -->
            <div class="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl relative overflow-hidden">
              <div class="absolute -right-6 -bottom-6 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
              <span class="text-4xl inline-block mb-3">💬</span>
              <h3 class="text-2xl font-black font-display">Instant WhatsApp Support</h3>
              <p class="text-emerald-100 text-sm mt-2 font-medium">Chat directly with our head toymaker. Send photos, ask for custom gift recommendations, or place orders in real-time!</p>
              
              <div class="mt-6">
                <a href="${defaultWhatsAppUrl}" target="_blank" class="btn-bubbly inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-emerald-800 font-black text-sm shadow-lg hover:bg-emerald-50 transition-all">
                  <span>Chat on WhatsApp Now</span>
                  <i data-lucide="external-link" class="w-4 h-4"></i>
                </a>
              </div>
              <div class="text-[11px] text-emerald-200 mt-3">Typical reply time: within 15 minutes</div>
            </div>

            <!-- Workshop Location & Hours -->
            <div class="p-6 rounded-3xl bg-white border border-amber-200 shadow-toy space-y-4 text-xs">
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-base">📍</div>
                <div>
                  <div class="font-extrabold text-stone-900 text-sm">Toy Castle Workshop</div>
                  <div class="text-stone-500 mt-0.5">123 Imagination Boulevard, Playville, NY 10001</div>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-base">⏰</div>
                <div>
                  <div class="font-extrabold text-stone-900 text-sm">Workshop Hours</div>
                  <div class="text-stone-500 mt-0.5">Monday – Saturday: 9:00 AM – 6:00 PM EST</div>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-base">✉️</div>
                <div>
                  <div class="font-extrabold text-stone-900 text-sm">Email Address</div>
                  <div class="text-stone-500 mt-0.5">hello@toyxima.com</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Contact Form & FAQs -->
          <div class="lg:col-span-7 space-y-8">
            <div class="bg-white p-8 rounded-[2.5rem] border border-amber-200 shadow-toy">
              <h3 class="text-2xl font-black font-display text-amber-950 mb-4">Send a Friendly Message</h3>
              
              <form id="contact-form" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-stone-700 mb-1">Your Name *</label>
                    <input required id="contact-name" type="text" placeholder="e.g. David Miller" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                    <input required id="contact-email" type="email" placeholder="e.g. david@example.com" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-stone-700 mb-1">Inquiry Topic</label>
                  <select id="contact-topic" class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-bold text-stone-700">
                    <option>Product Recommendation for Child's Age</option>
                    <option>Gift Wrapping & Handwritten Card Request</option>
                    <option>Shipping & Delivery Times</option>
                    <option>Wholesale & School Orders</option>
                    <option>Other Magical Inquiries</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-stone-700 mb-1">Your Message *</label>
                  <textarea required id="contact-msg" rows="4" placeholder="Tell us how we can help make play extra special..." class="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 text-sm font-medium"></textarea>
                </div>

                <button type="submit" class="btn-bubbly w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-md hover:shadow-orange-400/30">
                  Send Message ✨
                </button>
              </form>
            </div>

            <!-- FAQ Accordion -->
            <div class="bg-white p-6 rounded-3xl border border-amber-200 shadow-toy">
              <h4 class="font-black font-display text-lg text-amber-950 mb-3">Frequently Asked Questions</h4>
              
              <div class="space-y-3 text-xs">
                <details class="p-3 bg-amber-50/50 rounded-2xl cursor-pointer">
                  <summary class="font-extrabold text-stone-800">What materials do you use in your wooden toys?</summary>
                  <p class="mt-2 text-stone-600 leading-relaxed">We exclusively select sustainably harvested, FSC-certified European beechwood and solid ash. Every surface is finished with food-safe botanical waxes and non-toxic water-based stains.</p>
                </details>
                <details class="p-3 bg-amber-50/50 rounded-2xl cursor-pointer">
                  <summary class="font-extrabold text-stone-800">How long does shipping take?</summary>
                  <p class="mt-2 text-stone-600 leading-relaxed">Orders are carefully wrapped and dispatched from our workshop within 24 hours. Standard delivery takes 2–4 business days with live tracking provided.</p>
                </details>
                <details class="p-3 bg-amber-50/50 rounded-2xl cursor-pointer">
                  <summary class="font-extrabold text-stone-800">Can I order directly over WhatsApp?</summary>
                  <p class="mt-2 text-stone-600 leading-relaxed">Yes! You can add toys to your cart and click 'Order via WhatsApp'. All your items and notes will be packaged into a message for instant confirmation.</p>
                </details>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    document.getElementById('contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      sounds.playSparkle();
      this.showToast('Thank you! Your message has flown to our workshop 💌', 'success');
      e.target.reset();
    });

    this.refreshIcons();
  }

  // ----------------------------------------------------
  // 7. Admin / Inventory Management Portal
  // ----------------------------------------------------
  renderAdminView(container) {
    const products = store.getProducts();

    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span class="px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold uppercase tracking-wider">Toymaster Portal</span>
            <h1 class="text-3xl font-black font-display text-amber-950 mt-2">Manage Toy Inventory</h1>
            <p class="text-stone-600 text-xs sm:text-sm font-medium mt-1">Easily add new toys, update prices, manage stock, and export your catalog.</p>
          </div>

          <div class="flex items-center flex-wrap gap-2">
            <!-- Add New Toy Button -->
            <button id="admin-add-toy-btn" class="btn-bubbly px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add New Toy</span>
            </button>

            <!-- Export JSON -->
            <button id="admin-export-btn" class="px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 font-extrabold text-xs hover:bg-stone-50 flex items-center gap-1.5 shadow-sm" title="Download catalog JSON backup">
              <i data-lucide="download" class="w-4 h-4 text-stone-600"></i>
              <span>Export JSON</span>
            </button>

            <!-- Reset to Default Catalog -->
            <button id="admin-reset-btn" class="px-3 py-2.5 rounded-2xl bg-stone-100 text-stone-600 font-bold text-xs hover:bg-rose-50 hover:text-rose-600" title="Restore default 12 sample toys">
              Reset Default
            </button>
          </div>
        </div>

        <!-- Inventory Table Card -->
        <div class="bg-white rounded-[2rem] border border-amber-200 shadow-toy overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-amber-50/80 text-amber-950 font-black border-b border-amber-200">
                <tr>
                  <th class="py-3.5 px-4">Toy</th>
                  <th class="py-3.5 px-4">Category</th>
                  <th class="py-3.5 px-4">Age</th>
                  <th class="py-3.5 px-4">Price</th>
                  <th class="py-3.5 px-4">Stock</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100 text-stone-700 font-medium">
                ${products.map(p => `
                  <tr class="hover:bg-amber-50/40 transition-colors">
                    <td class="py-3 px-4 flex items-center gap-3">
                      <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200" />
                      <div>
                        <div class="font-extrabold text-stone-900">${p.name}</div>
                        <div class="text-[11px] text-stone-400 line-clamp-1">${p.tagline}</div>
                      </div>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2.5 py-1 rounded-lg bg-stone-100 font-bold text-stone-700">${p.categoryLabel}</span>
                    </td>
                    <td class="py-3 px-4 font-bold text-stone-600">${p.ageRange}</td>
                    <td class="py-3 px-4 font-black text-amber-950">$${p.price.toFixed(2)}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-md ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} font-extrabold text-[10px]">
                        ${p.inStock ? `${p.stockCount || 10} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button class="admin-edit-toy px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px]" data-id="${p.id}">
                        Edit
                      </button>
                      <button class="admin-del-toy px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px]" data-id="${p.id}">
                        Delete
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Hook Admin actions
    document.getElementById('admin-add-toy-btn')?.addEventListener('click', () => {
      sounds.playPop();
      this.openProductEditModal(null);
    });

    document.getElementById('admin-export-btn')?.addEventListener('click', () => {
      sounds.playSparkle();
      store.exportProductsJSON();
      this.showToast('Catalog exported as JSON file! 📂', 'success');
    });

    document.getElementById('admin-reset-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to restore the default sample toy catalog?')) {
        sounds.playPop();
        store.resetProductsToDefault();
      }
    });

    document.querySelectorAll('.admin-edit-toy').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playPop();
        const id = btn.getAttribute('data-id');
        const prod = store.getProductById(id);
        if (prod) this.openProductEditModal(prod);
      });
    });

    document.querySelectorAll('.admin-del-toy').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = store.getProductById(id);
        if (confirm(`Delete "${prod?.name}" from store?`)) {
          sounds.playPop();
          store.deleteProduct(id);
        }
      });
    });

    this.refreshIcons();
  }

  // Modal for Adding or Editing Product
  openProductEditModal(toy = null) {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    const isEdit = !!toy;

    modal.innerHTML = `
      <div class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white max-w-xl w-full rounded-[2.5rem] border border-amber-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
          <!-- Close Button -->
          <button id="edit-close-btn" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          <h3 class="text-2xl font-black font-display text-amber-950 mb-1">
            ${isEdit ? 'Edit Toy Details' : 'Add New Wonder Toy'}
          </h3>
          <p class="text-stone-500 text-xs mb-6">Changes update instantly on your store.</p>

          <form id="toy-edit-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Toy Title *</label>
              <input required id="edit-name" type="text" value="${toy?.name || ''}" placeholder="e.g. Vintage Wooden Steam Engine" class="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Short Tagline *</label>
              <input required id="edit-tagline" type="text" value="${toy?.tagline || ''}" placeholder="e.g. Handcrafted magnetic railway locomotive" class="w-full px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:border-orange-500 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                <select id="edit-cat" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold">
                  <option value="wooden" ${toy?.category === 'wooden' ? 'selected' : ''}>Wooden Marvels</option>
                  <option value="plush" ${toy?.category === 'plush' ? 'selected' : ''}>Plushies & Bears</option>
                  <option value="blocks" ${toy?.category === 'blocks' ? 'selected' : ''}>Building Blocks</option>
                  <option value="vehicles" ${toy?.category === 'vehicles' ? 'selected' : ''}>Vehicles & Racers</option>
                  <option value="stem" ${toy?.category === 'stem' ? 'selected' : ''}>STEM & Learning</option>
                  <option value="creative" ${toy?.category === 'creative' ? 'selected' : ''}>Creative & Pretend</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-stone-700 mb-1">Age Recommendation *</label>
                <input required id="edit-age" type="text" value="${toy?.ageRange || '2-6 Years'}" placeholder="e.g. 2-6 Years" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-stone-700 mb-1">Price ($) *</label>
                <input required id="edit-price" type="number" step="0.5" value="${toy?.price || 29.00}" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-black" />
              </div>
              <div>
                <label class="block text-xs font-bold text-stone-700 mb-1">Original Price ($)</label>
                <input id="edit-orig-price" type="number" step="0.5" value="${toy?.originalPrice || 35.00}" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Image URL *</label>
              <input required id="edit-img" type="url" value="${toy?.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'}" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
            </div>

            <div>
              <label class="block text-xs font-bold text-stone-700 mb-1">Description</label>
              <textarea id="edit-desc" rows="3" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs">${toy?.description || 'A magical toy handcrafted with organic materials and boundless imagination.'}</textarea>
            </div>

            <button type="submit" class="btn-bubbly w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow">
              ${isEdit ? 'Save Changes' : 'Create Toy'}
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('edit-close-btn')?.addEventListener('click', () => {
      sounds.playSwoosh();
      modal.innerHTML = '';
    });

    document.getElementById('toy-edit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const catSelect = document.getElementById('edit-cat');
      const catValue = catSelect.value;
      const catLabel = catSelect.options[catSelect.selectedIndex].text;

      const payload = {
        name: document.getElementById('edit-name')?.value,
        tagline: document.getElementById('edit-tagline')?.value,
        category: catValue,
        categoryLabel: catLabel,
        ageRange: document.getElementById('edit-age')?.value,
        price: parseFloat(document.getElementById('edit-price')?.value) || 25,
        originalPrice: parseFloat(document.getElementById('edit-orig-price')?.value) || 0,
        image: document.getElementById('edit-img')?.value,
        description: document.getElementById('edit-desc')?.value
      };

      if (isEdit) {
        store.updateProduct(toy.id, payload);
      } else {
        store.addProduct(payload);
      }

      sounds.playSparkle();
      modal.innerHTML = '';
    });

    this.refreshIcons();
  }

  // ----------------------------------------------------
  // Toast & Global Setup
  // ----------------------------------------------------
  renderToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }
  }

  initGlobalEvents() {
    // Enable audio context resume on first interaction
    document.addEventListener('pointerdown', () => sounds.init(), { once: true });
  }
}

// Instantiate App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.toyximaApp = new App();
});
