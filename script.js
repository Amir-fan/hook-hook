// ===== GLOBAL VARIABLES =====
let isScrolling = false;
let scrollTimeout;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// ===== INITIALIZATION =====
function initializeApp() {
  // Initialize AOS animations
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }
  
  // Initialize components immediately for instant loading
  initializeNavigation();
  initializeMenuFilter();
  initializeScrollEffects();
  initializeFloatingCTA();
  initialize3DModel();
  initializeOrderButtons();
  initializeDevTag();
  setActiveNavigation();
}



// ===== NAVIGATION =====
function initializeNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navList = document.querySelector('.nav-list');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navList.classList.toggle('active');
      navToggle.classList.toggle('active');
      
      // Animate hamburger menu
      const spans = navToggle.querySelectorAll('span');
      spans.forEach((span, index) => {
        if (navToggle.classList.contains('active')) {
          if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (index === 1) span.style.opacity = '0';
          if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
          span.style.transform = 'none';
          span.style.opacity = '1';
        }
      });
    });
  }
  
  // Smooth scroll for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Close mobile menu if open
      if (navList.classList.contains('active')) {
        navList.classList.remove('active');
        navToggle.classList.remove('active');
      }
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('active');
      navToggle.classList.remove('active');
    }
  });
}

// ===== MENU FILTER =====
function initializeMenuFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  const menuGrid = document.querySelector('.menu-grid');
  
  // Cache DOM elements for better performance
  const filterButtonsArray = Array.from(filterButtons);
  const menuItemsArray = Array.from(menuItems);
  
  // Prevent multiple rapid clicks
  let isFiltering = false;
  let currentCategory = 'burger';
  
  // Pre-calculate category mappings for faster filtering
  const categoryMap = new Map();
  menuItemsArray.forEach(item => {
    const category = item.getAttribute('data-category');
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category).push(item);
  });
  
  filterButtonsArray.forEach(button => {
    button.addEventListener('click', function() {
      if (isFiltering) return; // Prevent rapid clicks
      
      const category = this.getAttribute('data-category');
      if (category === currentCategory) return; // Skip if same category
      
      currentCategory = category;
      
      // Update active button instantly
      filterButtonsArray.forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = 'translateY(0)';
      });
      this.classList.add('active');
      
      // Start filtering
      isFiltering = true;
      
      // Use requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        // Hide all items first
        menuItemsArray.forEach(item => {
          item.style.display = 'none';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
        });
        
        // Show matching items with optimized timing
        const itemsToShow = categoryMap.get(category) || [];
        let delay = 0;
        
        itemsToShow.forEach((item, index) => {
          setTimeout(() => {
            item.style.display = 'block';
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          }, delay);
          delay += 30; // Reduced delay for faster response
        });
        
        // Reset filtering state
        setTimeout(() => {
          isFiltering = false;
        }, delay + 100);
      });
      
      // Track filter usage
      trackEvent('menu_filter', { category: category });
    });
  });
  
  // Optimized hover effects with passive listeners
  filterButtonsArray.forEach(button => {
    button.addEventListener('mouseenter', function() {
      if (!this.classList.contains('active') && !isFiltering) {
        this.style.transform = 'translateY(-1px)';
      }
    }, { passive: true });
    
    button.addEventListener('mouseleave', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'translateY(0)';
      }
    }, { passive: true });
  });
  
  // Initialize with burger category active
  setTimeout(() => {
    menuItemsArray.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      if (itemCategory === 'burger') {
        item.style.display = 'block';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      } else {
        item.style.display = 'none';
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
      }
    });
  }, 100);
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
  const navbar = document.getElementById('navbar');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Navbar background on scroll
    if (scrollTop > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.backdropFilter = 'blur(10px)';
    } else {
      navbar.style.background = 'var(--white)';
      navbar.style.backdropFilter = 'none';
    }
    
    // Hide/show navbar on scroll
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
    
    // Set active navigation
    if (!isScrolling) {
      setActiveNavigation();
    }
    
    // Debounce scroll events
    clearTimeout(scrollTimeout);
    isScrolling = true;
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 100);
  });
}

// ===== ACTIVE NAVIGATION =====
function setActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let currentSection = '';
  const scrollPosition = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

// ===== FLOATING CTA =====
function initializeFloatingCTA() {
  const floatingCTA = document.getElementById('floatingCta');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 500) {
      floatingCTA.classList.add('visible');
    } else {
      floatingCTA.classList.remove('visible');
    }
  });
}

// ===== 3D MODEL =====
function initialize3DModel() {
  const modelViewer = document.querySelector('model-viewer');
  const loadingOverlay = document.getElementById('modelLoadingOverlay');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  if (modelViewer) {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    }, 200);
    
    // Model loading events
    modelViewer.addEventListener('load', function() {
      clearInterval(progressInterval);
      progressFill.style.width = '100%';
      progressText.textContent = '100%';
      
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        modelViewer.style.opacity = '1';
        
        // Add success animation
        modelViewer.style.animation = 'modelLoaded 0.8s ease-out';
      }, 500);
      
      console.log('3D Model loaded successfully');
    });
    
    modelViewer.addEventListener('error', function() {
      clearInterval(progressInterval);
      loadingOverlay.innerHTML = `
        <div class="model-loading-content">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h3>خطأ في تحميل النموذج</h3>
          <p>يرجى تحديث الصفحة والمحاولة مرة أخرى</p>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
            تحديث الصفحة
          </button>
        </div>
      `;
      console.error('Error loading 3D model');
    });
    
    modelViewer.addEventListener('progress', function(event) {
      const progress = event.detail.totalProgress * 100;
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    });
    
    // Add intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          modelViewer.setAttribute('loading', 'eager');
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(modelViewer);
    
    // Add model loaded animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modelLoaded {
        0% {
          opacity: 0;
          transform: scale(0.9) rotateY(10deg);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.05) rotateY(-5deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

  
  // ===== ORDER BUTTONS =====
function initializeOrderButtons() {
  const orderButtons = document.querySelectorAll('.order-btn');
  
  orderButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Add click animation
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
      
      // Get item name from button or parent
      const itemName = this.getAttribute('data-item') || 
                      this.closest('.menu-item')?.querySelector('h3')?.textContent ||
                      'المنتج المحدد';
      
      // Show order confirmation
      showOrderConfirmation(itemName);
    });
  });
}

// ===== ORDER CONFIRMATION =====
function showOrderConfirmation(itemName) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'order-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>تأكيد الطلب</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <p>هل تريد طلب <strong>${itemName}</strong>؟</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeOrderModal()">إلغاء</button>
          <a href="https://wa.me/+963996222278" class="btn btn-primary" target="_blank">
            <span>واتساب الآن</span>
            <span class="btn-icon">📱</span>
          </a>
        </div>
      </div>
    </div>
  `;
  
  // Add modal styles
  const style = document.createElement('style');
  style.textContent = `
    .order-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      animation: slideUp 0.3s ease;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1.5rem;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(modal);
  
  // Close modal functionality
  modal.querySelector('.modal-close').addEventListener('click', closeOrderModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeOrderModal();
  });
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  const modal = document.querySelector('.order-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'visible';
  }
}

// ===== UTILITY FUNCTIONS =====
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const offsetTop = section.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function orderItem(itemName) {
  showOrderConfirmation(itemName);
}

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
  console.error('JavaScript Error:', e.error);
});

// ===== SERVICE WORKER (OPTIONAL) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Register service worker for caching
    // navigator.serviceWorker.register('/sw.js');
  });
}

// ===== ANALYTICS (OPTIONAL) =====
function trackEvent(eventName, eventData = {}) {
  // Google Analytics or other analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
  
  // Custom analytics
  console.log('Event tracked:', eventName, eventData);
}

// ===== DEV TAG FUNCTIONALITY =====
function initializeDevTag() {
  const devTag = document.getElementById('devTag');
  const devPopup = document.getElementById('devPopup');
  const devPopupClose = document.getElementById('devPopupClose');
  
  if (devTag && devPopup && devPopupClose) {
    // Open popup when dev tag is clicked
    devTag.addEventListener('click', function() {
      devPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    // Close popup when close button is clicked
    devPopupClose.addEventListener('click', function() {
      devPopup.classList.remove('active');
      document.body.style.overflow = 'visible';
    });
    
    // Close popup when clicking outside
    devPopup.addEventListener('click', function(e) {
      if (e.target === devPopup) {
        devPopup.classList.remove('active');
        document.body.style.overflow = 'visible';
      }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && devPopup.classList.contains('active')) {
        devPopup.classList.remove('active');
        document.body.style.overflow = 'visible';
      }
    });
  }
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.scrollToSection = scrollToSection;
window.scrollToTop = scrollToTop;
window.orderItem = orderItem;
window.closeOrderModal = closeOrderModal; 