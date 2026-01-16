document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const status = document.getElementById('status');

  startBtn.addEventListener('click', async () => {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        showStatus('No active tab found', 'error');
        return;
      }

      // Check if we can inject into this tab
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        showStatus('Cannot inspect browser pages', 'error');
        return;
      }

      // Inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Inject the CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content-styles.css']
      });

      showStatus('🎯 Inspecting... Click any element!', 'info');
      
      // Update button state
      startBtn.innerHTML = '<span class="btn-icon">✓</span> Inspecting...';
      startBtn.classList.add('active');

      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      showStatus('Error: ' + error.message, 'error');
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;
  }
});
