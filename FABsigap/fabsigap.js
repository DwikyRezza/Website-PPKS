// ============================================
// FAB SIGAP - MAIN CONTROLLER
// TTS Widget muncul DI ATAS button TTS
// ============================================

(function() {
  'use strict';

  let fabExpanded = false;
  let ttsWidgetOpen = false;

  // ============================================
  // CREATE FAB BUTTON STRUCTURE
  // ============================================
  function createFABButton() {
    const fabContainer = document.createElement('div');
    fabContainer.id = 'fab-sigap-container';
    fabContainer.className = 'fab-sigap-container';
    fabContainer.innerHTML = `
      <!-- Main FAB Button -->
      <button class="fab-main" id="fab-main-btn" aria-label="Buka Menu Bantuan" aria-expanded="false">
        <i class="fas fa-plus fab-icon fab-icon-plus"></i>
        <i class="fas fa-times fab-icon fab-icon-close"></i>
      </button>

      <!-- Menu Items -->
      <div class="fab-menu" id="fab-menu" aria-hidden="true">
        <button class="fab-item" data-feature="qna" aria-label="QnA Kesehatan Mental">
          <i class="fas fa-brain"></i>
          <span class="fab-label">QnA Mental Health</span>
        </button>

        <button class="fab-item" data-feature="chatbot" aria-label="Chat dengan TemanKu">
          <i class="fas fa-comments"></i>
          <span class="fab-label">Chat TemanKu</span>
        </button>

        <button class="fab-item" data-feature="tts" aria-label="Text-to-Speech" id="fab-tts-btn">
          <i class="fas fa-volume-up"></i>
          <span class="fab-label">Baca Otomatis</span>
        </button>

        <!-- TTS Widget (muncul DI ATAS button TTS) -->
        <div class="fab-tts-widget" id="fab-tts-widget">
          <div class="fab-tts-content">
            <div class="fab-tts-toggle-row">
              <span class="fab-tts-label">🔊 Baca Otomatis</span>
              <div class="custom-switch">
                <input type="checkbox" class="custom-control-input" id="fab-tts-switch">
                <label class="custom-control-label" for="fab-tts-switch"></label>
              </div>
            </div>
            <div class="fab-tts-speed-row">
              <span class="fab-tts-speed-label">Kecepatan:</span>
              <span class="fab-tts-speed-value" id="fab-tts-speed-value">1.0x</span>
            </div>
            <input type="range" class="fab-tts-speed-slider" id="fab-tts-speed-slider" 
                   min="0.5" max="2" step="0.1" value="1">
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(fabContainer);
  }

  // ============================================
  // TOGGLE FAB MENU
  // ============================================
  function toggleFAB() {
    fabExpanded = !fabExpanded;
    const mainBtn = document.getElementById('fab-main-btn');
    const menu = document.getElementById('fab-menu');
    
    if (fabExpanded) {
      mainBtn.classList.add('fab-expanded');
      mainBtn.setAttribute('aria-expanded', 'true');
      menu.classList.add('fab-menu-open');
      menu.setAttribute('aria-hidden', 'false');
    } else {
      mainBtn.classList.remove('fab-expanded');
      mainBtn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('fab-menu-open');
      menu.setAttribute('aria-hidden', 'true');
      
      // Close TTS widget if open (but TTS stays active)
      if (ttsWidgetOpen) {
        closeTTSWidget(false); // false = don't turn off TTS
      }
    }
  }

  // ============================================
  // TOGGLE TTS WIDGET
  // ============================================
  function openTTSWidget(event) {
    event.stopPropagation();
    
    const widget = document.getElementById('fab-tts-widget');
    const menu = document.getElementById('fab-menu');
    
    ttsWidgetOpen = true;
    widget.classList.add('show');
    menu.classList.add('tts-widget-open');
    
    console.log('✅ TTS Widget Opened');
  }

  function closeTTSWidget(turnOffTTS = true) {
    const widget = document.getElementById('fab-tts-widget');
    const menu = document.getElementById('fab-menu');
    const ttsSwitch = document.getElementById('fab-tts-switch');
    
    ttsWidgetOpen = false;
    widget.classList.remove('show');
    menu.classList.remove('tts-widget-open');
    
    // Only turn off TTS if explicitly requested
    if (turnOffTTS && ttsSwitch && ttsSwitch.checked) {
      ttsSwitch.checked = false;
      if (window.TTSModule) {
        window.TTSModule.deactivate();
      }
    }
    
    console.log(`⏹️ TTS Widget Closed (TTS ${turnOffTTS ? 'OFF' : 'stays ON'})`);
  }

  // ============================================
  // HANDLE FEATURE CLICK
  // ============================================
  function handleFeatureClick(feature, event) {
    console.log(`Feature clicked: ${feature}`);
    
    switch(feature) {
      case 'qna':
        if (window.QnAModule && window.QnAModule.open) {
          window.QnAModule.open();
        } else {
          alert('Fitur QnA Mental Health akan segera hadir!');
        }
        toggleFAB();
        break;
        
      case 'chatbot':
        if (window.TemanKuChatbot && window.TemanKuChatbot.open) {
          window.TemanKuChatbot.open();
        } else {
          alert('Fitur TemanKu Chatbot akan segera hadir!');
        }
        toggleFAB();
        break;
        
      case 'tts':
        // Toggle TTS widget (don't close FAB)
        event.stopPropagation();
        if (ttsWidgetOpen) {
          closeTTSWidget();
        } else {
          openTTSWidget(event);
        }
        break;
        
      default:
        console.warn('Unknown feature:', feature);
    }
  }

  // ============================================
  // INIT TTS CONTROLS
  // ============================================
  function initTTSControls() {
    const ttsSwitch = document.getElementById('fab-tts-switch');
    const speedSlider = document.getElementById('fab-tts-speed-slider');
    const speedValue = document.getElementById('fab-tts-speed-value');

    if (!ttsSwitch || !speedSlider || !speedValue) {
      console.warn('TTS controls not found');
      return;
    }

    // Toggle TTS on/off
    ttsSwitch.addEventListener('change', function() {
      const isActive = this.checked;
      
      if (window.TTSModule) {
        if (isActive) {
          window.TTSModule.activate();
          console.log('🔊 TTS Hover Mode Activated');
        } else {
          window.TTSModule.deactivate();
          console.log('🔇 TTS Hover Mode Deactivated');
          
          // Auto-close widget when manually turned off
          setTimeout(() => {
            closeTTSWidget(false); // Widget closes but TTS already off
          }, 300);
        }
      }
    });

    // Speed control
    speedSlider.addEventListener('input', function() {
      const speed = parseFloat(this.value);
      speedValue.textContent = speed.toFixed(1) + 'x';
      
      if (window.TTSModule && window.TTSModule.setSpeed) {
        window.TTSModule.setSpeed(speed);
      }
    });

    console.log('✅ TTS Controls Initialized');
  }

  // ============================================
  // INIT EVENT LISTENERS
  // ============================================
  function initEventListeners() {
    const mainBtn = document.getElementById('fab-main-btn');
    const fabItems = document.querySelectorAll('.fab-item');
    const ttsWidget = document.getElementById('fab-tts-widget');

    // Main button toggle
    mainBtn.addEventListener('click', toggleFAB);

    // Feature buttons
    fabItems.forEach(item => {
      item.addEventListener('click', (event) => {
        const feature = item.getAttribute('data-feature');
        handleFeatureClick(feature, event);
      });
    });

    // Prevent widget clicks from bubbling
    if (ttsWidget) {
      ttsWidget.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (ttsWidgetOpen) {
          closeTTSWidget();
        } else if (fabExpanded) {
          toggleFAB();
        }
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById('fab-sigap-container');
      if (fabExpanded && !container.contains(e.target)) {
        toggleFAB();
      }
    });

    // Initialize TTS controls
    initTTSControls();
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createFABButton();
        initEventListeners();
        console.log('✅ FAB Sigap Initialized');
      });
    } else {
      createFABButton();
      initEventListeners();
      console.log('✅ FAB Sigap Initialized');
    }
  }

  // Start
  init();

  // Export for debugging
  window.FABSigap = {
    toggle: toggleFAB,
    openTTSWidget: openTTSWidget,
    closeTTSWidget: closeTTSWidget,
    isExpanded: () => fabExpanded,
    isTTSWidgetOpen: () => ttsWidgetOpen
  };

})();