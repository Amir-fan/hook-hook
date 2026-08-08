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
  
  // Dynamic copyright year
  const yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Initialize components
  initializeNavigation();
  initializeMenuFilter();
  initializeScrollEffects();
  initialize3DModel();
  initializeDevTag();
  setActiveNavigation();
}




// ===== NAVIGATION =====
function initializeNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navList = document.querySelector('.nav-list');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navToggle || !navList) return;

  // 1. Toggle Function
  const toggleMenu = () => {
    const isOpened = navList.classList.contains('active');
    isOpened ? closeMenu() : openMenu();
  };

  // 2. Open Function
  const openMenu = () => {
    navList.classList.add('active');
    navToggle.classList.add('active');
    if (navBackdrop) navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  // 3. Close Function
  const closeMenu = () => {
    navList.classList.remove('active');
    navToggle.classList.remove('active');
    if (navBackdrop) navBackdrop.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  };

  // 4. Handle Link Clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      closeMenu();
      
      // Handle internal section scrolling
      if (href.startsWith('#')) {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
          const offsetTop = section.offsetTop - 80;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      }
    });
  });

  // Event Listeners
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMenu);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
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
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (isFiltering) return; // Prevent rapid clicks
      
      const category = this.getAttribute('data-category');
      if (category === currentCategory) return; // Skip if same category
      
      currentCategory = category;
      
      // Update active button instantly
      filterButtonsArray.forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = 'translateY(0)';
        btn.style.pointerEvents = 'none'; // Disable during transition
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
        
        // Reset filtering state and re-enable buttons
        setTimeout(() => {
          isFiltering = false;
          filterButtonsArray.forEach(btn => {
            btn.style.pointerEvents = 'auto'; // Re-enable after transition
          });
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
  const floatingCTA = document.getElementById('floatingCta');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Navbar background on scroll
    if (scrollTop > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    
    // Floating back-to-top visibility
    if (floatingCTA) {
      floatingCTA.classList.toggle('visible', scrollTop > 500);
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

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
  console.error('JavaScript Error:', e.error);
});

// ===== ANALYTICS =====
function trackEvent(eventName, eventData = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
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
      document.body.style.overflow = '';
    });
    
    // Close popup when clicking outside
    devPopup.addEventListener('click', function(e) {
      if (e.target === devPopup) {
        devPopup.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && devPopup.classList.contains('active')) {
        devPopup.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.scrollToSection = scrollToSection;
window.scrollToTop = scrollToTop; 