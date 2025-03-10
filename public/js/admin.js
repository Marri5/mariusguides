/**
 * Marius Guides - Admin JavaScript
 * Enhanced with content block sorting functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize admin sidebar toggle for mobile
  initAdminSidebar();
  
  // Initialize content block type switcher
  initContentBlockTypeSwitcher();
  
  // Initialize delete confirmations
  initDeleteConfirmations();
  
  // Initialize content block sorting
  initContentBlockSorting();
  
  // Initialize rich text editor if available
  initRichTextEditor();
});

/**
 * Initialize admin sidebar toggle for mobile
 */
function initAdminSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  
  // Only proceed if we have a sidebar
  if (sidebar) {
    // Calculate sidebar positioning
    adjustSidebarHeight();
    
    // Listen for window resize to readjust sidebar
    window.addEventListener('resize', adjustSidebarHeight);
    
    // Create toggle button if it doesn't exist and we're on mobile
    if (window.innerWidth <= 992 && !document.getElementById('sidebarToggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'sidebarToggle';
      toggleBtn.className = 'admin-toggle';
      toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
      document.body.appendChild(toggleBtn);
      
      // Add click event to toggle
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
      });
      
      // Close sidebar when clicking outside
      document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('active');
          toggleBtn.querySelector('i').classList.remove('fa-times');
          toggleBtn.querySelector('i').classList.add('fa-bars');
        }
      });
    }
  }
}

/**
 * Adjust sidebar height based on header and footer
 */
function adjustSidebarHeight() {
  const sidebar = document.querySelector('.admin-sidebar');
  const header = document.querySelector('.site-header');
  
  if (sidebar && header) {
    const headerHeight = header.offsetHeight;
    sidebar.style.top = headerHeight + 'px';
    sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
    
    // Adjust content margin as well
    const adminContent = document.querySelector('.admin-content');
    if (adminContent) {
      if (window.innerWidth <= 992) {
        adminContent.style.marginLeft = '0';
        adminContent.style.width = '100%';
      } else {
        const sidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width') || '250px';
        adminContent.style.marginLeft = sidebarWidth;
        adminContent.style.width = `calc(100% - ${sidebarWidth})`;
      }
    }
  }
}

/**
 * Initialize content block type switcher
 */
function initContentBlockTypeSwitcher() {
  const blockTypeSelect = document.getElementById('type');
  const contentField = document.getElementById('content-field');
  const mediaField = document.getElementById('media-field');
  
  if (blockTypeSelect && contentField && mediaField) {
    // Initial state
    updateFieldVisibility(blockTypeSelect.value);
    
    // On change
    blockTypeSelect.addEventListener('change', function() {
      updateFieldVisibility(this.value);
    });
  }
  
  function updateFieldVisibility(blockType) {
    if (['text', 'code', 'markdown', 'embeddedContent'].includes(blockType)) {
      contentField.style.display = 'block';
      mediaField.style.display = 'none';
    } else if (['image', 'video'].includes(blockType)) {
      contentField.style.display = 'none';
      mediaField.style.display = 'block';
    }
  }
}

/**
 * Initialize delete confirmations
 */
function initDeleteConfirmations() {
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!this.closest('form').hasAttribute('onsubmit')) {
        e.preventDefault();
        
        const confirmMessage = this.getAttribute('data-confirm') || 'Are you sure you want to delete this item?';
        
        if (confirm(confirmMessage)) {
          const form = this.closest('form');
          if (form) {
            form.submit();
          } else {
            window.location.href = this.getAttribute('href');
          }
        }
      }
    });
  });
}

/**
 * Initialize content block sorting
 */
function initContentBlockSorting() {
  const contentBlocksContainer = document.querySelector('.content-blocks-container');
  
  if (contentBlocksContainer && typeof Sortable !== 'undefined') {
    Sortable.create(contentBlocksContainer, {
      handle: '.drag-handle',
      animation: 150,
      onEnd: function(evt) {
        // Update positions after sorting
        const blocks = contentBlocksContainer.querySelectorAll('.content-block-item');
        const positions = [];
        
        blocks.forEach((block, index) => {
          const blockId = block.getAttribute('data-id');
          const positionInput = block.querySelector('.position-input');
          
          if (positionInput) {
            positionInput.value = index;
          }
          
          positions.push({
            id: blockId,
            position: index
          });
        });
        
        // Send updated positions to server
        if (positions.length > 0) {
          updateBlockPositions(positions);
        }
      }
    });
  }
  
  function updateBlockPositions(positions) {
    fetch('/admin/content-blocks/update-positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ positions })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showNotification('Positions updated successfully', 'success');
      } else {
        showNotification('Failed to update positions', 'error');
      }
    })
    .catch(error => {
      console.error('Error updating positions:', error);
      showNotification('An error occurred while updating positions', 'error');
    });
  }
}

/**
 * Initialize rich text editor
 */
function initRichTextEditor() {
  const textareas = document.querySelectorAll('textarea.rich-editor');
  
  if (textareas.length > 0 && typeof ClassicEditor !== 'undefined') {
    textareas.forEach(textarea => {
      ClassicEditor
        .create(textarea, {
          toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo']
        })
        .catch(error => {
          console.error('Error initializing rich text editor:', error);
        });
    });
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.admin-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'admin-notification';
    document.body.appendChild(notification);
  }
  
  // Set notification content and type
  notification.textContent = message;
  notification.className = `admin-notification ${type}`;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Tab functionality for the guide edit page
 */
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tabs li a');
  const panes = document.querySelectorAll('.tab-pane');
  
  if (tabs.length === 0 || panes.length === 0) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all tabs and panes
      tabs.forEach(t => t.parentElement.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      
      // Add active class to current tab and corresponding pane
      this.parentElement.classList.add('active');
      const target = this.getAttribute('href').substring(1);
      document.getElementById(target).classList.add('active');
    });
  });
} 