/* ============================================
   FOODIFY — App Logic & Interactions
   ============================================ */

// ---- State ----
let currentPage = 'home';
let currentSlide = 0;
let heroInterval = null;
let cartOpen = false;
let sidebarOpen = false;
let cartCount = 3;

// ---- Splash Screen ----
function showAuth() {
  const splash = document.getElementById('splash-screen');
  splash.style.opacity = '0';
  splash.style.transition = 'opacity 0.5s ease';
  setTimeout(() => {
    splash.style.display = 'none';
    document.getElementById('auth-page').style.display = 'flex';
  }, 500);
}

function showSplash() {
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('auth-page').style.display = 'none';
  const splash = document.getElementById('splash-screen');
  splash.style.display = 'flex';
  splash.style.opacity = '1';
}

// ---- Auth Navigation ----
function showLogin() {
  document.getElementById('auth-signup').style.display = 'none';
  document.getElementById('auth-otp').style.display = 'none';
  document.getElementById('auth-login').style.display = 'flex';
}

function showSignup() {
  document.getElementById('auth-login').style.display = 'none';
  document.getElementById('auth-otp').style.display = 'none';
  document.getElementById('auth-signup').style.display = 'flex';
}

function showOTP() {
  document.getElementById('auth-login').style.display = 'none';
  document.getElementById('auth-signup').style.display = 'none';
  document.getElementById('auth-otp').style.display = 'flex';
  startOTPCountdown();
}

// ---- OTP ----
function startOTPCountdown() {
  let seconds = 30;
  const el = document.getElementById('otp-countdown');
  const resendBtn = document.getElementById('resend-btn');
  if (resendBtn) resendBtn.disabled = true;

  const interval = setInterval(() => {
    seconds--;
    if (el) el.textContent = `00:${seconds.toString().padStart(2, '0')}`;
    if (seconds <= 0) {
      clearInterval(interval);
      if (el) el.textContent = '00:00';
      if (resendBtn) resendBtn.disabled = false;
    }
  }, 1000);
}

// OTP auto-focus
document.addEventListener('DOMContentLoaded', () => {
  const otpInputs = document.querySelectorAll('.otp-digit');
  otpInputs.forEach((input, i) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });
  });
});

// ---- Enter App ----
function enterApp() {
  document.getElementById('auth-page').style.display = 'none';
  document.getElementById('app-shell').style.display = 'flex';
  startHeroCarousel();
  animatePageElements();
}

// ---- Password Toggle ----
function togglePw(btn) {
  const input = btn.parentElement.querySelector('input');
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// ---- Navigation ----
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // Show target page
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    currentPage = page;
  }

  // Update sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) item.classList.add('active');
  });

  // Update bottom nav
  document.querySelectorAll('.bn-item').forEach(item => {
    item.classList.remove('active');
  });

  // Close sidebar on mobile
  if (sidebarOpen) toggleSidebar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Animate elements
  animatePageElements();
}

function animatePageElements() {
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;

  const elements = activePage.querySelectorAll('.food-card, .rest-card, .offer-card, .order-history-card, .notif-item, .txn-item, .food-list-item, .recent-card, .coupon-card');
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'all 0.4s ease-out';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50 + (i * 60));
  });
}

// ---- Sidebar Toggle (Mobile) ----
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebarOpen = !sidebarOpen;
  if (sidebarOpen) {
    sidebar.style.transform = 'translateX(0)';
    sidebar.style.boxShadow = '4px 0 20px rgba(0,0,0,0.15)';
  } else {
    sidebar.style.transform = 'translateX(-100%)';
    sidebar.style.boxShadow = 'none';
  }
}

// ---- Hero Carousel ----
function startHeroCarousel() {
  heroInterval = setInterval(() => slideHero(1), 5000);
}

function slideHero(dir) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = (currentSlide + dir + slides.length) % slides.length;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  // Reset timer
  clearInterval(heroInterval);
  heroInterval = setInterval(() => slideHero(1), 5000);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = index;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  clearInterval(heroInterval);
  heroInterval = setInterval(() => slideHero(1), 5000);
}

// ---- Theme Toggle ----
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('theme-icon');
  const darkSwitch = document.getElementById('dark-switch');

  if (html.dataset.theme === 'dark') {
    html.dataset.theme = 'light';
    if (icon) icon.className = 'fas fa-moon';
    if (darkSwitch) darkSwitch.checked = false;
  } else {
    html.dataset.theme = 'dark';
    if (icon) icon.className = 'fas fa-sun';
    if (darkSwitch) darkSwitch.checked = true;
  }
}

// ---- Cart ----
function toggleCart() {
  cartOpen = !cartOpen;
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');

  if (cartOpen) {
    panel.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function addToCart() {
  cartCount++;
  updateCartBadge();
  showToast('Added to cart! 🛒', 'success');

  // Animate cart icon
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.style.animation = 'bounceIn 0.5s ease';
    setTimeout(() => cartBtn.style.animation = '', 500);
  }
}

function updateCartBadge() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cartCount;
  });
  document.querySelectorAll('.bn-badge').forEach(el => {
    el.textContent = cartCount;
  });
  const fcCount = document.querySelector('.fc-count');
  if (fcCount) fcCount.textContent = `${cartCount} items`;
}

function changeQty(btn, delta) {
  const qtyEl = btn.parentElement.querySelector('span');
  let qty = parseInt(qtyEl.textContent);
  qty = Math.max(1, qty + delta);
  qtyEl.textContent = qty;
}

function removeCartItem(btn) {
  const item = btn.closest('.cart-item');
  item.style.transform = 'translateX(100%)';
  item.style.opacity = '0';
  item.style.transition = 'all 0.3s ease';
  setTimeout(() => item.remove(), 300);
  cartCount = Math.max(0, cartCount - 1);
  updateCartBadge();
}

// ---- Wishlist ----
function toggleWishlist(btn) {
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  if (btn.classList.contains('liked')) {
    icon.className = 'fas fa-heart';
    btn.style.animation = 'heartBeat 0.6s ease';
    showToast('Added to wishlist ❤️');
  } else {
    icon.className = 'far fa-heart';
    btn.style.animation = '';
    showToast('Removed from wishlist');
  }
}

// ---- Food Detail Modal ----
function openFoodDetail() {
  const modal = document.getElementById('food-detail-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// ---- Restaurant Detail ----
function openRestaurant() {
  navigateTo('restaurant-detail');
}

// ---- Order Tabs ----
function switchOrderTab(btn, tab) {
  document.querySelectorAll('.otab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('[id^="order-tab-"]').forEach(el => el.style.display = 'none');
  const target = document.getElementById(`order-tab-${tab}`);
  if (target) target.style.display = 'block';
}

// ---- Filter Tabs ----
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('ftab') || e.target.classList.contains('chip')) {
    const parent = e.target.parentElement;
    parent.querySelectorAll('.ftab, .chip').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }

  // Spice selector
  if (e.target.classList.contains('spice-btn')) {
    e.target.parentElement.querySelectorAll('.spice-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }

  // Tip selector
  if (e.target.classList.contains('tip-btn')) {
    e.target.parentElement.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }

  // Menu tabs
  if (e.target.classList.contains('mtab')) {
    e.target.parentElement.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }

  // Custom radio options
  if (e.target.closest('.custom-option')) {
    const option = e.target.closest('.custom-option');
    const group = option.closest('.custom-group');
    const radio = option.querySelector('.custom-radio');
    if (radio) {
      group.querySelectorAll('.custom-option').forEach(o => {
        o.classList.remove('selected');
        const r = o.querySelector('.custom-radio');
        if (r) r.classList.remove('active');
      });
      option.classList.add('selected');
      radio.classList.add('active');
    }

    const check = option.querySelector('.custom-check');
    if (check) {
      option.classList.toggle('selected');
      check.classList.toggle('active');
    }
  }

  // Payment options
  if (e.target.closest('.pay-option')) {
    document.querySelectorAll('.pay-option').forEach(p => p.classList.remove('selected'));
    e.target.closest('.pay-option').classList.add('selected');
  }

  // Address cards
  if (e.target.closest('.addr-card:not(.add-new)')) {
    document.querySelectorAll('.addr-card').forEach(a => a.classList.remove('selected'));
    e.target.closest('.addr-card').classList.add('selected');
  }

  // View toggle
  if (e.target.closest('.vt')) {
    document.querySelectorAll('.vt').forEach(v => v.classList.remove('active'));
    e.target.closest('.vt').classList.add('active');
  }
});

// ---- Chat ----
function sendChatMsg() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const container = document.getElementById('chat-messages');

  // User message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.innerHTML = `
    <div class="chat-avatar">AK</div>
    <div class="chat-bubble">
      <p>${msg}</p>
      <small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
    </div>
  `;
  container.appendChild(userMsg);
  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Bot reply after delay
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.innerHTML = `
      <div class="chat-avatar"><i class="fas fa-robot"></i></div>
      <div class="chat-bubble">
        <p>${getBotReply(msg)}</p>
        <small>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
      </div>
    `;
    container.appendChild(botMsg);
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

function sendQuickReply(btn) {
  const input = document.getElementById('chat-input');
  input.value = btn.textContent;
  sendChatMsg();
}

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('track') || lower.includes('order')) {
    return "I can see your order #FD-2847 is currently on the way! Your rider Rahul is approximately 12 minutes away. Would you like me to show you the live tracking? 📍";
  }
  if (lower.includes('refund')) {
    return "I'd be happy to help with a refund. Could you please share the order ID and reason for the refund? Our team will review it within 24 hours. 💰";
  }
  if (lower.includes('issue') || lower.includes('problem') || lower.includes('complaint')) {
    return "I'm sorry to hear you're having an issue! Could you please describe the problem in detail? I'll make sure our team resolves it as quickly as possible. 🛠️";
  }
  if (lower.includes('agent') || lower.includes('human')) {
    return "Sure! I'm connecting you with a live agent now. Please hold on for a moment... Our average wait time is under 2 minutes. 👨‍💻";
  }
  return "Thanks for reaching out! I understand your concern. Let me look into this for you. Is there anything specific you'd like help with? You can also check our FAQ section for quick answers. 😊";
}

// ---- Toast Notifications ----
function showToast(message, type = '') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fas fa-circle-info';
  if (type === 'success') icon = 'fas fa-circle-check';
  if (type === 'error') icon = 'fas fa-circle-xmark';

  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Promo Code ----
function applyPromo() {
  const input = document.getElementById('promo-input');
  if (input && input.value.trim()) {
    showToast('Promo code applied! 🎉', 'success');
    input.value = '';
  } else {
    showToast('Please enter a promo code', 'error');
  }
}

// ---- Ripple Effect on Buttons ----
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-main, .add-btn, .hero-cta');
  if (!btn) return;

  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    pointer-events: none;
    animation: ripple 0.6s ease-out;
  `;

  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ---- Search ----
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        navigateTo('restaurants');
        showToast(`Searching for "${searchInput.value}"...`);
      }
    });
  }
});

// ---- Scroll Animations (Intersection Observer) ----
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.food-card, .rest-card, .offer-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s ease-out';
    observer.observe(el);
  });
});

// ---- Keyboard Shortcuts ----
document.addEventListener('keydown', (e) => {
  // ESC to close modals/cart
  if (e.key === 'Escape') {
    if (cartOpen) toggleCart();
    document.querySelectorAll('.modal-backdrop.active').forEach(m => {
      m.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// ---- Close modal on backdrop click ----
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  // Auto-skip splash after 3s (uncomment for auto-skip)
  // setTimeout(showAuth, 3000);

  // Responsive sidebar handling
  if (window.innerWidth <= 900) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.style.transform = 'translateX(-100%)';
      sidebar.style.position = 'fixed';
      sidebar.style.zIndex = '999';
    }
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth > 900) {
    if (sidebar) {
      sidebar.style.transform = '';
      sidebar.style.boxShadow = '';
    }
    sidebarOpen = false;
  } else {
    if (sidebar && !sidebarOpen) {
      sidebar.style.transform = 'translateX(-100%)';
    }
  }
});

console.log('🍔 FOODIFY — Ready to serve deliciousness!');
