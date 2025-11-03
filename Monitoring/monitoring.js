// ============================================
// MONITORING.JS - Complete System Logic
// Version: 2.0.0
// Professional, production-ready code
// ============================================

(function() {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const State = {
    currentReport: null,
    currentStepIndex: 0,
    isAnimating: false,
    isSearching: false,
    completedSteps: new Set()
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const DOM = {
    reportIdInput: document.getElementById('reportIdInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchLoader: document.getElementById('searchLoader'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    timelineContainer: document.getElementById('timelineContainer'),
    timelineHeader: document.getElementById('timelineHeader'),
    timelineTitle: document.getElementById('timelineTitle'),
    timelineId: document.getElementById('timelineId'),
    timelineDate: document.getElementById('timelineDate'),
    statusBadge: document.getElementById('statusBadge'),
    statusText: document.getElementById('statusText'),
    timeline: document.getElementById('timeline'),
    particlesBg: document.getElementById('particlesBg')
  };

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    searchDelay: 1200,           // ms to simulate search
    stepAnimationDelay: 4000,    // ms per step (4 seconds as requested)
    cubeToIconTransition: 3000,  // ms cube shows before icon (3 seconds as requested)
    typingDelay: 500,            // ms before typing starts
    confettiDelay: 1000          // ms after all steps complete
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    console.log('🚀 Monitoring System v2.0 Initializing...');
    
    // Generate particles
    generateParticles();
    
    // Check URL parameter
    checkURLParameter();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Monitoring System Ready');
  }

  // ============================================
  // GENERATE PARTICLES
  // ============================================
  function generateParticles() {
    const particlesContainer = DOM.particlesBg?.querySelector('.bottom-particles');
    if (!particlesContainer) return;
    
    const particleCount = window.innerWidth > 768 ? 50 : 30;
    
    for (let i = 0; i < particleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      particlesContainer.appendChild(bubble);
    }
    
    console.log(`🎈 Generated ${particleCount} particles`);
  }

  // ============================================
  // SETUP EVENT LISTENERS
  // ============================================
  function setupEventListeners() {
    // Search button
    if (DOM.searchBtn) {
      DOM.searchBtn.addEventListener('click', handleSearch);
    }
    
    // Enter key in input
    if (DOM.reportIdInput) {
      DOM.reportIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearch();
        }
      });
      
      // Clear error on input
      DOM.reportIdInput.addEventListener('input', () => {
        hideError();
        DOM.reportIdInput.value = DOM.reportIdInput.value.toUpperCase();
      });
    }
  }

  // ============================================
  // CHECK URL PARAMETER
  // Auto-search if ?id=xxx from landing page
  // ============================================
  function checkURLParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');
    
    if (reportId) {
      console.log('🔍 Auto-search triggered:', reportId);
      DOM.reportIdInput.value = reportId.toUpperCase();
      
      setTimeout(() => {
        handleSearch();
      }, 1000);
    }
  }

  // ============================================
  // HANDLE SEARCH
  // ============================================
  async function handleSearch() {
    // Prevent multiple searches
    if (State.isSearching || State.isAnimating) {
      console.log('⏳ Already processing...');
      return;
    }
    
    const reportId = DOM.reportIdInput.value.trim().toUpperCase();
    
    // Validation
    if (!reportId) {
      showError('Silakan masukkan ID Laporan.');
      return;
    }
    
    console.log('🔎 Searching for report:', reportId);
    
    // UI: Show loading
    State.isSearching = true;
    disableInput();
    hideError();
    showSearchLoader();
    
    // Simulate search delay
    await sleep(CONFIG.searchDelay);
    
    // Check if report exists
    const report = getReportById(reportId);
    
    hideSearchLoader();
    
    if (!report) {
      // Not found
      console.log('❌ Report not found:', reportId);
      showError(`ID Laporan "${reportId}" tidak ditemukan. Silakan periksa kembali.`);
      enableInput();
      State.isSearching = false;
      return;
    }
    
    // Found!
    console.log('✅ Report found:', report);
    State.currentReport = report;
    State.currentStepIndex = 0;
    State.completedSteps.clear();
    
    // Update UI
    updateTimelineHeader();
    clearTimeline();
    
    // Start animation after a brief pause
    setTimeout(() => {
      State.isSearching = false;
      animateTimeline();
    }, 500);
  }

  // ============================================
  // UPDATE TIMELINE HEADER
  // ============================================
  function updateTimelineHeader() {
    if (!State.currentReport) return;
    
    // Show header
    DOM.timelineHeader.style.display = 'flex';
    DOM.timelineHeader.style.opacity = '0';
    DOM.timelineHeader.style.transform = 'translateY(-12px)';
    
    // Update content
    DOM.timelineTitle.textContent = `Progress Laporan`;
    DOM.timelineId.textContent = State.currentReport.id;
    
    // Format date
    const date = new Date(State.currentReport.createdAt);
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    DOM.timelineDate.textContent = formattedDate;
    
    // Status badge
    const isCompleted = State.currentReport.status === 'completed';
    DOM.statusBadge.className = `timeline-status-badge ${isCompleted ? 'status-completed' : ''}`;
    DOM.statusBadge.innerHTML = `
      <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-clock'}"></i>
      <span id="statusText">${isCompleted ? 'Selesai' : 'Dalam Proses'}</span>
    `;
    
    // Animate in
    requestAnimationFrame(() => {
      DOM.timelineHeader.style.transition = 'all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
      DOM.timelineHeader.style.opacity = '1';
      DOM.timelineHeader.style.transform = 'translateY(0)';
    });
  }

  // ============================================
  // CLEAR TIMELINE
  // ============================================
  function clearTimeline() {
    DOM.timeline.style.opacity = '0';
    
    setTimeout(() => {
      DOM.timeline.innerHTML = '';
      DOM.timeline.style.transition = 'opacity 0.4s ease';
      DOM.timeline.style.opacity = '1';
    }, 300);
  }

  // ============================================
  // ANIMATE TIMELINE (Main Logic)
  // ============================================
  function animateTimeline() {
    if (!State.currentReport || !State.currentReport.steps) {
      console.error('❌ No steps to animate');
      return;
    }
    
    State.isAnimating = true;
    console.log('🎬 Starting timeline animation...');
    
    animateNextStep();
  }

  // ============================================
  // ANIMATE NEXT STEP (Recursive)
  // ============================================
  function animateNextStep() {
    // Check if done
    if (State.currentStepIndex >= State.currentReport.steps.length) {
      console.log('✅ Timeline animation completed');
      State.isAnimating = false;
      enableInput();
      
      // Check if all steps succeeded (for confetti)
      const allSuccess = State.currentReport.steps.every(s => s.status === 'success');
      if (allSuccess) {
        setTimeout(() => {
          console.log('🎉 All steps completed! Starting confetti...');
          if (window.Confetti) {
            window.Confetti.start();
          }
        }, CONFIG.confettiDelay);
      }
      
      return;
    }
    
    const step = State.currentReport.steps[State.currentStepIndex];
    console.log(`📍 Step ${step.id}: ${step.title} (${step.status})`);
    
    // Create step element
    const stepElement = createStepElement(step);
    DOM.timeline.appendChild(stepElement);
    
    // Animate in
    requestAnimationFrame(() => {
      stepElement.style.opacity = '1';
      stepElement.style.transform = 'translateY(0)';
    });
    
    // Handle step based on status
    if (step.status === 'loading') {
      // STUCK - Show cube, no transition
      handleLoadingStep(stepElement, step);
    } else if (step.status === 'success') {
      // SUCCESS - Show cube → transition to icon → next step
      handleSuccessStep(stepElement, step);
    } else if (step.status === 'failed') {
      // FAILED - Show cube → transition to failed icon → stop
      handleFailedStep(stepElement, step);
    }
  }

  // ============================================
  // HANDLE LOADING STEP (Stuck state)
  // ============================================
  function handleLoadingStep(stepElement, step) {
    console.log(`⏸ STUCK at step ${step.id}`);
    
    // Cube stays, no transition
    // Typing effect for description
    const descElement = stepElement.querySelector('.timeline-content-desc');
    if (descElement && window.TypingEffect) {
      setTimeout(() => {
        window.TypingEffect.type(descElement, step.description);
      }, CONFIG.typingDelay);
    }
    
    // Enable input after animation settles
    setTimeout(() => {
      State.isAnimating = false;
      enableInput();
    }, CONFIG.cubeToIconTransition);
  }

  // ============================================
  // HANDLE SUCCESS STEP
  // ============================================
  function handleSuccessStep(stepElement, step) {
    const marker = stepElement.querySelector('.timeline-marker');
    const descElement = stepElement.querySelector('.timeline-content-desc');
    
    // Phase 1: Cube animation (3 seconds)
    setTimeout(() => {
      // Transition cube to success icon
      transitionCubeToIcon(marker, step.icon, 'marker-success');
      
      // Update content status
      stepElement.classList.remove('status-loading');
      stepElement.classList.add('status-success');
      
      // Start typing description
      if (descElement && window.TypingEffect) {
        window.TypingEffect.type(descElement, step.description, () => {
          // After typing completes, mark as done
          State.completedSteps.add(step.id);
          console.log(`✅ Step ${step.id} completed`);
        });
      }
      
    }, CONFIG.cubeToIconTransition);
    
    // Phase 2: Move to next step (4 seconds total)
    setTimeout(() => {
      State.currentStepIndex++;
      animateNextStep();
    }, CONFIG.stepAnimationDelay);
  }

  // ============================================
  // HANDLE FAILED STEP
  // ============================================
  function handleFailedStep(stepElement, step) {
    const marker = stepElement.querySelector('.timeline-marker');
    const descElement = stepElement.querySelector('.timeline-content-desc');
    
    setTimeout(() => {
      // Transition to failed icon
      transitionCubeToIcon(marker, step.icon, 'marker-failed');
      
      // Update content
      stepElement.classList.remove('status-loading');
      stepElement.classList.add('status-failed');
      
      // Type description
      if (descElement && window.TypingEffect) {
        window.TypingEffect.type(descElement, step.description);
      }
      
      console.log(`❌ Step ${step.id} failed`);
      
      // Stop animation
      State.isAnimating = false;
      enableInput();
      
    }, CONFIG.cubeToIconTransition);
  }

  // ============================================
  // TRANSITION CUBE TO ICON (Smooth)
  // ============================================
  function transitionCubeToIcon(marker, icon, className) {
    // Fade out cube
    marker.style.transition = 'opacity 0.3s ease';
    marker.style.opacity = '0';
    
    setTimeout(() => {
      // Remove cube
      const cubeWrapper = marker.querySelector('.cube-wrapper');
      if (cubeWrapper) {
        cubeWrapper.remove();
      }
      
      // Add icon
      marker.innerHTML = icon;
      marker.classList.remove('marker-loading');
      marker.classList.add(className);
      
      // Fade in icon
      marker.style.opacity = '1';
      marker.style.transform = 'scale(1.2)';
      
      setTimeout(() => {
        marker.style.transform = 'scale(1)';
      }, 200);
      
    }, 300);
  }

  // ============================================
  // CREATE STEP ELEMENT
  // ============================================
  function createStepElement(step) {
    const stepElement = document.createElement('div');
    stepElement.className = `timeline-item status-${step.status}`;
    stepElement.style.opacity = '0';
    stepElement.style.transform = 'translateY(24px)';
    stepElement.style.transition = 'all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
    
    // Marker
    const marker = document.createElement('div');
    marker.className = `timeline-marker marker-loading`;
    
    // Always start with cube
    marker.innerHTML = createCubeHTML();
    
    // Content
    const content = document.createElement('div');
    content.className = 'timeline-content';
    
    const title = document.createElement('div');
    title.className = 'timeline-content-title';
    title.textContent = step.title;
    
    const desc = document.createElement('p');
    desc.className = 'timeline-content-desc';
    // Text will be typed in by TypingEffect
    
    content.appendChild(title);
    content.appendChild(desc);
    
    stepElement.appendChild(marker);
    stepElement.appendChild(content);
    
    return stepElement;
  }

  // ============================================
  // CREATE CUBE HTML
  // ============================================
  function createCubeHTML() {
    return `
      <div class="cube-wrapper small">
        <div class="cube">
          <div class="cube-faces">
            <div class="cube-face shadow"></div>
            <div class="cube-face bottom"></div>
            <div class="cube-face top"></div>
            <div class="cube-face left"></div>
            <div class="cube-face right"></div>
            <div class="cube-face back"></div>
            <div class="cube-face front"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // UI HELPERS
  // ============================================
  function showSearchLoader() {
    DOM.searchLoader?.classList.add('show');
  }

  function hideSearchLoader() {
    DOM.searchLoader?.classList.remove('show');
  }

  function showError(message) {
    DOM.errorText.textContent = message;
    DOM.errorMessage.classList.add('show');
  }

  function hideError() {
    DOM.errorMessage.classList.remove('show');
  }

  function disableInput() {
    DOM.reportIdInput.disabled = true;
    DOM.searchBtn.disabled = true;
    DOM.searchBtn.classList.add('loading');
  }

  function enableInput() {
    DOM.reportIdInput.disabled = false;
    DOM.searchBtn.disabled = false;
    DOM.searchBtn.classList.remove('loading');
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getReportById(reportId) {
    if (typeof DUMMY_REPORTS === 'undefined') {
      console.error('❌ DUMMY_REPORTS not loaded!');
      return null;
    }
    return DUMMY_REPORTS[reportId] || null;
  }

  // ============================================
  // PUBLIC API (for debugging)
  // ============================================
  window.MonitoringSystem = {
    search: handleSearch,
    getState: () => ({ ...State }),
    getReport: getReportById,
    clearTimeline,
    version: '2.0.0'
  };

  // ============================================
  // INITIALIZE
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();