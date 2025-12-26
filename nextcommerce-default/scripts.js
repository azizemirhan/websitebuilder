/**
 * NextCommerce Default Theme
 * JavaScript Module
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // ========================================
    // DOM Elements
    // ========================================
    const ncdElements = {
        header: document.querySelector('.ncd-header'),
        searchTrigger: document.getElementById('ncdSearchTrigger'),
        searchOverlay: document.getElementById('ncdSearchOverlay'),
        searchClose: document.getElementById('ncdSearchClose'),
        searchInput: document.querySelector('.ncd-search-input'),
        mobileMenuTrigger: document.getElementById('ncdMobileMenuTrigger'),
        mobileMenu: document.getElementById('ncdMobileMenu'),
        mobileMenuClose: document.getElementById('ncdMobileMenuClose'),
        cartTrigger: document.getElementById('ncdCartTrigger'),
        cartSidebar: document.getElementById('ncdCartSidebar'),
        cartOverlay: document.getElementById('ncdCartOverlay'),
        cartClose: document.getElementById('ncdCartClose'),
        heroSlider: document.getElementById('ncdHeroSlider'),
        heroPrev: document.getElementById('ncdHeroPrev'),
        heroNext: document.getElementById('ncdHeroNext'),
        heroDots: document.getElementById('ncdHeroDots'),
        productTabs: document.querySelectorAll('.ncd-product-tab')
    };

    // ========================================
    // State
    // ========================================
    const ncdState = {
        currentSlide: 0,
        totalSlides: 3,
        slideInterval: null,
        isSearchOpen: false,
        isMobileMenuOpen: false,
        isCartOpen: false
    };

    // ========================================
    // Header Scroll Effect
    // ========================================
    function initHeaderScroll() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                ncdElements.header.classList.add('ncd-header--scrolled');
            } else {
                ncdElements.header.classList.remove('ncd-header--scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ========================================
    // Search Functionality
    // ========================================
    function initSearch() {
        if (!ncdElements.searchTrigger || !ncdElements.searchOverlay) return;

        ncdElements.searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });

        ncdElements.searchClose?.addEventListener('click', () => {
            closeSearch();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ncdState.isSearchOpen) {
                closeSearch();
            }
        });

        // Close on outside click
        ncdElements.searchOverlay.addEventListener('click', (e) => {
            if (e.target === ncdElements.searchOverlay) {
                closeSearch();
            }
        });
    }

    function openSearch() {
        ncdState.isSearchOpen = true;
        ncdElements.searchOverlay.classList.add('ncd-search-overlay--active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            ncdElements.searchInput?.focus();
        }, 300);
    }

    function closeSearch() {
        ncdState.isSearchOpen = false;
        ncdElements.searchOverlay.classList.remove('ncd-search-overlay--active');
        document.body.style.overflow = '';
    }

    // ========================================
    // Mobile Menu
    // ========================================
    function initMobileMenu() {
        if (!ncdElements.mobileMenuTrigger || !ncdElements.mobileMenu) return;

        ncdElements.mobileMenuTrigger.addEventListener('click', () => {
            openMobileMenu();
        });

        ncdElements.mobileMenuClose?.addEventListener('click', () => {
            closeMobileMenu();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ncdState.isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        ncdState.isMobileMenuOpen = true;
        ncdElements.mobileMenu.classList.add('ncd-mobile-menu--active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        ncdState.isMobileMenuOpen = false;
        ncdElements.mobileMenu.classList.remove('ncd-mobile-menu--active');
        document.body.style.overflow = '';
    }

    // ========================================
    // Cart Sidebar
    // ========================================
    function initCart() {
        if (!ncdElements.cartTrigger || !ncdElements.cartSidebar) return;

        ncdElements.cartTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });

        ncdElements.cartClose?.addEventListener('click', () => {
            closeCart();
        });

        ncdElements.cartOverlay?.addEventListener('click', () => {
            closeCart();
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ncdState.isCartOpen) {
                closeCart();
            }
        });

        // Quantity buttons
        initQuantityButtons();
    }

    function openCart() {
        ncdState.isCartOpen = true;
        ncdElements.cartSidebar.classList.add('ncd-cart-sidebar--active');
        ncdElements.cartOverlay?.classList.add('ncd-cart-overlay--active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        ncdState.isCartOpen = false;
        ncdElements.cartSidebar.classList.remove('ncd-cart-sidebar--active');
        ncdElements.cartOverlay?.classList.remove('ncd-cart-overlay--active');
        document.body.style.overflow = '';
    }

    function initQuantityButtons() {
        const qtyButtons = document.querySelectorAll('.ncd-qty-btn');
        
        qtyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = btn.closest('.ncd-cart-item-qty');
                const valueEl = container?.querySelector('.ncd-qty-value');
                if (!valueEl) return;

                let value = parseInt(valueEl.textContent) || 1;
                
                if (btn.textContent === '+') {
                    value++;
                } else if (btn.textContent === '-' && value > 1) {
                    value--;
                }
                
                valueEl.textContent = value;
            });
        });
    }

    // ========================================
    // Hero Slider
    // ========================================
    function initHeroSlider() {
        if (!ncdElements.heroSlider) return;

        const slides = ncdElements.heroSlider.querySelectorAll('.ncd-hero-slide');
        const dots = ncdElements.heroDots?.querySelectorAll('.ncd-hero-dot');
        
        ncdState.totalSlides = slides.length;

        // Navigation buttons
        ncdElements.heroPrev?.addEventListener('click', () => {
            goToSlide(ncdState.currentSlide - 1);
            resetAutoSlide();
        });

        ncdElements.heroNext?.addEventListener('click', () => {
            goToSlide(ncdState.currentSlide + 1);
            resetAutoSlide();
        });

        // Dots
        dots?.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
        });

        // Auto slide
        startAutoSlide();

        // Pause on hover
        ncdElements.heroSlider.addEventListener('mouseenter', () => {
            stopAutoSlide();
        });

        ncdElements.heroSlider.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }

    function goToSlide(index) {
        const slides = ncdElements.heroSlider.querySelectorAll('.ncd-hero-slide');
        const dots = ncdElements.heroDots?.querySelectorAll('.ncd-hero-dot');

        // Wrap around
        if (index < 0) index = ncdState.totalSlides - 1;
        if (index >= ncdState.totalSlides) index = 0;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('ncd-hero-slide--active', i === index);
        });

        // Update dots
        dots?.forEach((dot, i) => {
            dot.classList.toggle('ncd-hero-dot--active', i === index);
        });

        ncdState.currentSlide = index;
    }

    function startAutoSlide() {
        ncdState.slideInterval = setInterval(() => {
            goToSlide(ncdState.currentSlide + 1);
        }, 6000);
    }

    function stopAutoSlide() {
        if (ncdState.slideInterval) {
            clearInterval(ncdState.slideInterval);
            ncdState.slideInterval = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    // ========================================
    // Product Tabs
    // ========================================
    function initProductTabs() {
        if (!ncdElements.productTabs.length) return;

        ncdElements.productTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all
                ncdElements.productTabs.forEach(t => {
                    t.classList.remove('ncd-product-tab--active');
                });
                
                // Add active to clicked
                tab.classList.add('ncd-product-tab--active');
                
                // Here you would typically load products based on tab
                // For demo purposes, we just switch the active state
                const tabType = tab.dataset.tab;
                console.log('Switched to tab:', tabType);
            });
        });
    }

    // ========================================
    // Product Card Interactions
    // ========================================
    function initProductCards() {
        // Wishlist toggle
        const wishlistBtns = document.querySelectorAll('.ncd-product-action[aria-label="Favorilere Ekle"]');
        
        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btn.classList.toggle('ncd-product-action--active');
                
                const isActive = btn.classList.contains('ncd-product-action--active');
                const svg = btn.querySelector('svg');
                
                if (svg) {
                    svg.setAttribute('fill', isActive ? 'currentColor' : 'none');
                }
            });
        });

        // Add to cart
        const addToCartBtns = document.querySelectorAll('.ncd-product-add-cart');
        
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Show feedback
                const originalText = btn.textContent;
                btn.textContent = 'Eklendi ✓';
                btn.style.background = 'var(--ncd-color-success)';
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
                
                // Update cart count
                const cartCount = document.querySelector('.ncd-cart-count');
                if (cartCount) {
                    const count = parseInt(cartCount.textContent) || 0;
                    cartCount.textContent = count + 1;
                }
            });
        });
    }

    // ========================================
    // Newsletter Form
    // ========================================
    function initNewsletter() {
        const form = document.querySelector('.ncd-newsletter-form');
        
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const input = form.querySelector('.ncd-newsletter-input');
            const btn = form.querySelector('.ncd-btn');
            const email = input?.value;
            
            if (!email || !validateEmail(email)) {
                input?.classList.add('ncd-input--error');
                return;
            }
            
            // Simulate submission
            btn.textContent = 'Gönderiliyor...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = 'Abone Olundu ✓';
                btn.style.background = 'var(--ncd-color-success)';
                input.value = '';
                
                setTimeout(() => {
                    btn.textContent = 'Abone Ol';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ========================================
    // Lazy Loading Images
    // ========================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // ========================================
    // Smooth Scroll
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ========================================
    // Animation on Scroll
    // ========================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        if (!animatedElements.length) return;

        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('ncd-animated');
                    }
                });
            }, {
                threshold: 0.1
            });

            animatedElements.forEach(el => animationObserver.observe(el));
        }
    }

    // ========================================
    // Initialize All
    // ========================================
    function init() {
        initHeaderScroll();
        initSearch();
        initMobileMenu();
        initCart();
        initHeroSlider();
        initProductTabs();
        initProductCards();
        initNewsletter();
        initLazyLoading();
        initSmoothScroll();
        initScrollAnimations();

        console.log('NextCommerce Default Theme initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();