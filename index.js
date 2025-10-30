// Interaktivitas menenangkan & aksesibel
// - Smooth scroll, navbar scrolled
// - Reveal on scroll (staggered), counters
// - Mobile menu with transition + body scroll lock
// - Tabs, Accordion (ARIA + animated height)
// - Loading state empatik
// - Optional subtle parallax
// - TTS HOVER FEATURE - INSTANT (NO DELAY) - FIXED ON/OFF ISSUE

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // TTS HOVER FEATURE - INSTANT MODE - START
  // ============================================
  const synth = window.speechSynthesis;
  let ttsActive = false;
  let currentUtterance = null;
  let speechRate = 1.0;
  let highlightedElement = null;
  let voicesLoaded = false;

  // PENTING: Preload voices dan warm-up speech engine
  function initializeSpeechEngine() {
    // Force load voices
    const voices = synth.getVoices();
    
    // Warm-up: buat utterance dummy untuk inisialisasi engine
    if (!voicesLoaded && voices.length > 0) {
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0; // Silent
      warmup.rate = 1.0;
      warmup.lang = 'id-ID';
      synth.speak(warmup);
      voicesLoaded = true;
      console.log('🔥 Speech Engine Warmed Up!');
    }
  }

  // Load voices saat ready
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = initializeSpeechEngine;
  }
  
  // Init langsung jika voices sudah tersedia
  setTimeout(initializeSpeechEngine, 100);

  // Create Floating TTS Toggle Button (Saklar Style)
  function createTTSButton() {
    // Container untuk toggle switch
    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'tts-toggle-container';
    toggleContainer.className = 'tts-toggle-container';
    toggleContainer.innerHTML = `
      <div class="tts-toggle-wrapper">
        <span class="tts-toggle-label">🔊 Baca Otomatis</span>
        <label class="tts-switch">
          <input type="checkbox" id="tts-toggle-checkbox">
          <span class="tts-slider"></span>
        </label>
      </div>
      <div class="tts-speed-mini">
        <label>
          <span>Kecepatan:</span>
          <span class="speed-value-mini" id="speedValueMini">1.0x</span>
        </label>
        <input type="range" id="speedSliderMini" min="0.5" max="2" step="0.1" value="1">
      </div>
    `;
    document.body.appendChild(toggleContainer);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      /* Toggle Container */
      .tts-toggle-container {
        position: fixed;
        right: 20px;
        bottom: 20px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        z-index: 9998;
        transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        min-width: 240px;
      }
      
      .tts-toggle-container:hover {
        box-shadow: 0 6px 28px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }
      
      .tts-toggle-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }
      
      .tts-toggle-label {
        font-size: 0.95rem;
        font-weight: 600;
        color: #333;
      }
      
      /* Toggle Switch (Saklar) */
      .tts-switch {
        position: relative;
        display: inline-block;
        width: 52px;
        height: 28px;
        flex-shrink: 0;
      }
      
      .tts-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .tts-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 28px;
      }
      
      .tts-slider:before {
        position: absolute;
        content: "";
        height: 20px;
        width: 20px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      input:checked + .tts-slider {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      }
      
      input:checked + .tts-slider:before {
        transform: translateX(24px);
      }
      
      input:focus + .tts-slider {
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
      }
      
      /* Speed Control Mini */
      .tts-speed-mini {
        border-top: 1px solid #e0e0e0;
        padding-top: 12px;
      }
      
      .tts-speed-mini label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 0.85rem;
        color: #666;
        font-weight: 500;
      }
      
      .speed-value-mini {
        background: #667eea;
        color: white;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      
      #speedSliderMini {
        width: 100%;
        cursor: pointer;
        height: 4px;
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;
        background: #e0e0e0;
      }
      
      #speedSliderMini::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #667eea;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      }
      
      #speedSliderMini::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      
      #speedSliderMini::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #667eea;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      /* Highlight effect */
      .tts-highlight {
        background-color: rgba(255, 235, 59, 0.4) !important;
        outline: 2px solid #FFC107;
        outline-offset: 2px;
        border-radius: 3px;
        transition: all 0.3s ease;
      }
      
      /* Speaking indicator */
      .tts-speaking-indicator {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        display: none;
        align-items: center;
        gap: 8px;
        z-index: 9997;
        animation: slideIn 0.3s ease;
        font-size: 0.85rem;
        font-weight: 600;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .tts-speaking-indicator.show {
        display: flex;
      }
      
      .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .tts-toggle-container {
          right: 15px;
          bottom: 15px;
          min-width: 220px;
        }
        
        .tts-speaking-indicator {
          bottom: 80px;
          right: 15px;
        }
      }
      
      /* Smooth hover cursor for readable elements when TTS active */
      [data-tts-enabled="true"]:hover {
        background-color: rgba(102, 126, 234, 0.05);
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize TTS UI
  createTTSButton();

  // Create speaking indicator
  const indicator = document.createElement('div');
  indicator.className = 'tts-speaking-indicator';
  indicator.innerHTML = '<span class="spinner"></span><span>Membaca...</span>';
  document.body.appendChild(indicator);

  // Get elements
  const toggleCheckbox = document.getElementById('tts-toggle-checkbox');
  const speedSliderMini = document.getElementById('speedSliderMini');
  const speedValueMini = document.getElementById('speedValueMini');

  // Function to speak on hover - INSTANT, NO QUEUE
  function speakOnHover(event) {
    if (!ttsActive) return;
    
    const target = event.currentTarget;
    let text = '';
    
    // Get text content intelligently
    if (target.tagName === 'IMG' && target.alt) {
      text = 'Gambar: ' + target.alt;
    } else if (target.tagName === 'A' && target.textContent.trim()) {
      text = 'Tautan: ' + target.textContent.trim();
    } else {
      text = target.innerText || target.textContent;
    }
    
    text = text.trim();
    if (!text || text.length < 2) return;
    
    // INSTANT CANCEL - Langsung hentikan speech sebelumnya
    synth.cancel();
    
    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('tts-highlight');
    }
    
    // Highlight current element
    target.classList.add('tts-highlight');
    highlightedElement = target;
    
    // Create and speak utterance IMMEDIATELY
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'id-ID';
    currentUtterance.rate = speechRate;
    currentUtterance.volume = 1.0;
    currentUtterance.pitch = 1.0;
    
    currentUtterance.onstart = () => {
      indicator.classList.add('show');
    };
    
    currentUtterance.onend = () => {
      indicator.classList.remove('show');
      if (highlightedElement === target) {
        highlightedElement.classList.remove('tts-highlight');
        highlightedElement = null;
      }
      currentUtterance = null;
    };
    
    currentUtterance.onerror = (e) => {
      console.error('TTS Error:', e);
      indicator.classList.remove('show');
    };
    
    // Speak INSTANTLY without any delay
    synth.speak(currentUtterance);
  }

  // Remove hover listeners from elements
  function removeTTSListeners() {
    const elements = document.querySelectorAll('[data-tts-enabled="true"]');
    elements.forEach(el => {
      el.removeEventListener('mouseenter', speakOnHover);
      el.removeAttribute('data-tts-enabled');
      el.classList.remove('tts-highlight');
    });
  }

  // Attach hover listeners to ALL text elements
  function attachTTSListeners() {
    // Comprehensive selectors for ALL text content
    const selectors = [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'div', 'a', 'li', 'td', 'th',
      'label', 'button', 'input[type="text"]',
      'textarea', 'blockquote', 'code', 'pre',
      'figcaption', 'caption', 'legend',
      'dt', 'dd', 'address', 'cite',
      'img[alt]',
      '.description', '.card-text', '.card-title',
      '.stat-label', '.stat-number', '.faq-answer',
      '.step-number', '.nav-item', '.btn'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    let count = 0;
    
    elements.forEach(el => {
      // Skip if already has listener or no text content
      if (el.dataset.ttsEnabled === 'true') return;
      
      const hasText = (el.innerText || el.textContent || el.alt || '').trim().length > 0;
      if (!hasText) return;
      
      // Skip script and style tags
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      
      el.addEventListener('mouseenter', speakOnHover);
      el.setAttribute('data-tts-enabled', 'true');
      count++;
    });
    
    console.log(`✅ TTS: ${count} elemen siap dibaca`);
  }

  // Toggle TTS Mode (Saklar)
  toggleCheckbox.addEventListener('change', () => {
    ttsActive = toggleCheckbox.checked;
    
    if (ttsActive) {
      console.log('🔊 TTS Mode: ON');
      
      // PENTING: Reinitialize speech engine saat ON lagi
      initializeSpeechEngine();
      
      // Tambahan: Clear queue untuk memastikan tidak ada antrian
      synth.cancel();
      
      attachTTSListeners();
    } else {
      console.log('🔇 TTS Mode: OFF');
      // Stop current speech
      synth.cancel();
      indicator.classList.remove('show');
      
      // Remove highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('tts-highlight');
        highlightedElement = null;
      }
      
      // Remove all listeners
      removeTTSListeners();
    }
  });

  // Speed control
  speedSliderMini.addEventListener('input', (e) => {
    speechRate = parseFloat(e.target.value);
    speedValueMini.textContent = speechRate.toFixed(1) + 'x';
  });

  // Keyboard controls (only when TTS active)
  document.addEventListener('keydown', (e) => {
    if (!ttsActive) return;
    
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (synth.speaking) {
        synth.pause();
        console.log('⏸ TTS Dijeda');
      }
    }
    
    if (e.shiftKey && !e.ctrlKey && !e.altKey && currentUtterance) {
      e.preventDefault();
      synth.cancel();
      synth.speak(currentUtterance);
      console.log('🔄 TTS Diulang');
    }
    
    if (e.key === 'Escape') {
      synth.cancel();
      indicator.classList.remove('show');
      if (highlightedElement) {
        highlightedElement.classList.remove('tts-highlight');
        highlightedElement = null;
      }
      console.log('⏹ TTS Dihentikan');
    }
  });

  // Resume on any click (if paused)
  document.addEventListener('click', () => {
    if (ttsActive && synth.paused) {
      synth.resume();
      console.log('▶ TTS Dilanjutkan');
    }
  });

  // ============================================
  // TTS HOVER FEATURE - END
  // ============================================

  // Smooth scroll for internal anchors
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;
    const id = target.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => {
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }, prefersReduced ? 0 : 300);
  });

  // Navbar transparency on scroll
  const navbar = document.querySelector('.navbar');
  const updateNav = () => {
    if (!navbar) return;
    if (window.scrollY > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // Reveal on scroll and counters
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  const statEls = Array.from(document.querySelectorAll('.stat-number'));
  const formatId = new Intl.NumberFormat('id-ID');

  const animateCount = (el) => {
    if (el.dataset.counted === 'true') return;
    const text = el.textContent.trim();
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) return;
    const target = parseInt(digits, 10);
    const duration = prefersReduced ? 0 : 1600;
    const start = performance.now();
    el.dataset.counted = 'true';
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const current = Math.round(target * eased);
      el.textContent = formatId.format(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatId.format(target);
    };
    if (duration === 0) { el.textContent = formatId.format(target); return; }
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            if (parent && !parent.dataset.staggered) {
              const group = Array.from(parent.querySelectorAll('[data-reveal]'));
              group.forEach((el, idx) => {
                el.style.transitionDelay = prefersReduced ? '0ms' : `${Math.min(idx * 100, 600)}ms`;
              });
              parent.dataset.staggered = 'true';
            }
            entry.target.classList.add('is-visible');
            if (entry.target.classList.contains('stat-number')) animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
    statEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    statEls.forEach((el) => animateCount(el));
  }

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const primaryNav = document.getElementById('primary-navigation');
  if (hamburger && primaryNav) {
    const closeMenu = () => {
      hamburger.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('open');
      document.body.classList.remove('menu-open');
    };
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        primaryNav.classList.add('open');
        document.body.classList.add('menu-open');
        const firstItem = primaryNav.querySelector('.nav-item');
        if (firstItem) setTimeout(() => firstItem.focus(), 150);
      } else {
        closeMenu();
      }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    primaryNav.addEventListener('click', (e) => { if (e.target.closest('.nav-item')) closeMenu(); });
  }

  // Tabs
  const tabList = document.querySelector('.tab-nav');
  if (tabList) {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      });
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = (idx + dir + tabs.length) % tabs.length;
          tabs[next].focus();
        }
      });
    });
  }

  // Accordion / FAQ
  const faqButtons = Array.from(document.querySelectorAll('.faq-button'));
  const getAnswer = (btn) => btn.nextElementSibling;
  const collapse = (answer, btn) => {
    if (!answer || !answer.classList.contains('show')) return;
    btn && btn.setAttribute('aria-expanded', 'false');
    const startHeight = answer.scrollHeight;
    answer.style.height = startHeight + 'px';
    answer.classList.add('animating');
    requestAnimationFrame(() => { answer.style.height = '0px'; answer.classList.remove('show'); });
    answer.addEventListener('transitionend', () => { answer.classList.remove('animating'); answer.style.height = ''; }, { once: true });
  };
  const expand = (answer, btn) => {
    if (!answer || answer.classList.contains('show')) return;
    btn && btn.setAttribute('aria-expanded', 'true');
    answer.classList.add('show', 'animating');
    answer.style.height = '0px';
    const targetHeight = answer.scrollHeight;
    requestAnimationFrame(() => { answer.style.height = targetHeight + 'px'; });
    answer.addEventListener('transitionend', () => { answer.classList.remove('animating'); answer.style.height = ''; }, { once: true });
  };
  if (faqButtons.length) {
    faqButtons.forEach((btn, i) => {
      const answer = getAnswer(btn);
      const open = answer && answer.classList.contains('show');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (answer && !answer.id) answer.id = `faq-${i + 1}`;
      if (answer) btn.setAttribute('aria-controls', answer.id);
      btn.addEventListener('click', () => {
        faqButtons.forEach((other) => { if (other !== btn) collapse(getAnswer(other), other); });
        const ans = getAnswer(btn);
        if (ans.classList.contains('show')) collapse(ans, btn); else expand(ans, btn);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const dir = e.key === 'ArrowDown' ? 1 : -1;
          const idx = faqButtons.indexOf(btn);
          const next = (idx + dir + faqButtons.length) % faqButtons.length;
          faqButtons[next].focus();
        }
      });
    });
  }

  // Loading state for monitoring
  const checkBtn = document.getElementById('checkProgressBtn');
  const progressStatusDiv = document.getElementById('progressStatus');
  const kodeInput = document.getElementById('kodeLaporan');
  if (checkBtn && progressStatusDiv && kodeInput) {
    checkBtn.addEventListener('click', function () {
      const kode = kodeInput.value.trim();
      progressStatusDiv.innerHTML = '';
      if (kode === '') { 
        progressStatusDiv.innerHTML = '<span style="color: #a94442;">Silakan masukkan kode laporan terlebih dahulu.</span>'; 
        return; 
      }
      checkBtn.disabled = true;
      const spinner = document.createElement('span'); 
      spinner.className = 'spinner'; 
      spinner.setAttribute('aria-hidden', 'true');
      spinner.style.cssText = 'display:inline-block;width:16px;height:16px;border:3px solid #ccc;border-top-color:#667eea;border-radius:50%;animation:spin 0.8s linear infinite;';
      const loadingText = document.createElement('span'); 
      loadingText.style.marginLeft = '8px'; 
      loadingText.textContent = 'Memeriksa...';
      progressStatusDiv.appendChild(spinner); 
      progressStatusDiv.appendChild(loadingText);
      setTimeout(() => {
        let msg = '';
        if (kode === 'PPKS123') {
          msg = '<span style="color: #2e7d32;">Status: Laporan Anda sedang dalam tahap Verifikasi Awal oleh tim kami.</span>';
        } else if (kode === 'PPKS456') {
          msg = '<span style="color: #1565c0;">Status: Laporan telah dilanjutkan ke tahap Investigasi.</span>';
        } else {
          msg = '<span style="color: #ef6c00;">Kode laporan tidak ditemukan. Pastikan kode benar, ya.</span>';
        }
        progressStatusDiv.innerHTML = msg;
        checkBtn.disabled = false;
      }, 600);
    });
  }

  // Subtle parallax
  const boxBlue = document.querySelector('.box-blue');
  if (boxBlue && !prefersReduced) {
    const onScroll = () => { 
      boxBlue.style.transform = `translateY(${window.scrollY * 0.06}px)`; 
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})()