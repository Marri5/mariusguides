/**
 * Marius Guides - Main JavaScript
 * Client-side functionality for the public-facing site
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
  }
  
  // User dropdown menu
  const userMenuBtn = document.querySelector('.user-menu-btn');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (userMenuBtn && dropdownMenu) {
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!userMenuBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = 'none';
      }
    });
    
    // Toggle dropdown on click
    userMenuBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      const isVisible = dropdownMenu.style.display === 'block';
      dropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Initialize any interactive elements
  initializeInteractiveElements();
});

/**
 * Initialize interactive elements on the page
 */
function initializeInteractiveElements() {
  // Add active class to current nav item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.main-nav a, .mobile-menu a');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath.startsWith(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
    }
  });
  
  // Initialize code blocks with syntax highlighting if available
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightBlock(block);
    });
  }
  
  // Initialize lightbox for images if available
  if (typeof SimpleLightbox !== 'undefined') {
    new SimpleLightbox('.image-block img', {
      captionsData: 'alt',
      captionDelay: 250
    });
  }
} 