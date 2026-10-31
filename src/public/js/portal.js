/**
 * LeadFlow Portal Interactive Client Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification Utility
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // 2. Keyboard shortcut: Press '/' to focus search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // 3. Status Radio Card selection behavior
  const statusCards = document.querySelectorAll('.status-radio-card');
  statusCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio) {
      radio.addEventListener('change', () => {
        statusCards.forEach(c => c.classList.remove('selected'));
        if (radio.checked) {
          card.classList.add('selected');
        }
      });
    }
  });

  // 4. Auto-hide success alerts after 5 seconds
  const successAlerts = document.querySelectorAll('.alert-success');
  successAlerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });
});
