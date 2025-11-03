// ============================================
// TYPING-EFFECT.JS
// Realistic typing animation for timeline text
// Smooth, natural character-by-character reveal
// ============================================

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    typingSpeed: 35,        // ms per character (faster = lower number)
    initialDelay: 500,      // ms before typing starts
    cursorBlinkSpeed: 530,  // ms cursor blink interval
    naturalVariation: 15,   // ms random variation for natural feel
  };

  /**
   * Type text character by character into an element
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to type
   * @param {Function} onComplete - Callback when typing completes
   */
  function typeText(element, text, onComplete) {
    if (!element || !text) {
      console.warn('⚠️ TypeText: Invalid element or text');
      if (onComplete) onComplete();
      return;
    }

    // Clear element and add typing class
    element.textContent = '';
    element.classList.add('typing');
    
    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    cursor.style.cssText = `
      display: inline-block;
      margin-left: 2px;
      animation: cursorBlink ${CONFIG.cursorBlinkSpeed}ms infinite;
      color: var(--monitoring-secondary);
      font-weight: 600;
    `;
    
    element.appendChild(cursor);
    
    // Split text into characters
    const characters = text.split('');
    let currentIndex = 0;
    
    // Start typing after initial delay
    setTimeout(() => {
      const typeNextChar = () => {
        if (currentIndex >= characters.length) {
          // Typing complete
          setTimeout(() => {
            cursor.remove();
            element.classList.remove('typing');
            if (onComplete) onComplete();
          }, 300);
          return;
        }
        
        // Get current character
        const char = characters[currentIndex];
        
        // Create text node for character
        const charNode = document.createTextNode(char);
        element.insertBefore(charNode, cursor);
        
        currentIndex++;
        
        // Calculate next delay with natural variation
        const baseDelay = CONFIG.typingSpeed;
        const variation = Math.random() * CONFIG.naturalVariation - (CONFIG.naturalVariation / 2);
        const delay = baseDelay + variation;
        
        // Add extra pause for punctuation (more natural)
        const extraPause = ['.', '!', '?', ','].includes(char) ? 150 : 0;
        
        // Schedule next character
        setTimeout(typeNextChar, delay + extraPause);
      };
      
      typeNextChar();
    }, CONFIG.initialDelay);
  }

  /**
   * Type text with fade-in effect (alternative style)
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to type
   * @param {Function} onComplete - Callback when typing completes
   */
  function typeTextFade(element, text, onComplete) {
    if (!element || !text) {
      if (onComplete) onComplete();
      return;
    }

    element.textContent = '';
    element.classList.add('typing');
    
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    const typeNextWord = () => {
      if (currentWordIndex >= words.length) {
        element.classList.remove('typing');
        if (onComplete) onComplete();
        return;
      }
      
      const word = words[currentWordIndex];
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word + (currentWordIndex < words.length - 1 ? ' ' : '');
      wordSpan.style.cssText = `
        opacity: 0;
        display: inline-block;
        animation: fadeInWord 0.3s ease forwards;
      `;
      
      element.appendChild(wordSpan);
      currentWordIndex++;
      
      setTimeout(typeNextWord, 100);
    };
    
    setTimeout(typeNextWord, CONFIG.initialDelay);
  }

  /**
   * Instant reveal with optional animation
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to reveal
   * @param {boolean} animate - Whether to animate
   */
  function revealText(element, text, animate = true) {
    if (!element || !text) return;
    
    element.textContent = text;
    
    if (animate) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(8px)';
      
      requestAnimationFrame(() => {
        element.style.transition = 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    }
  }

  /**
   * Clear typing effect and restore normal text
   * @param {HTMLElement} element - Target element
   */
  function clearTyping(element) {
    if (!element) return;
    
    element.classList.remove('typing');
    const cursor = element.querySelector('.typing-cursor');
    if (cursor) cursor.remove();
  }

  // Add CSS for cursor blink and fade-in animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cursorBlink {
      0%, 49% {
        opacity: 1;
      }
      50%, 100% {
        opacity: 0;
      }
    }
    
    @keyframes fadeInWord {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .typing-cursor {
      animation: cursorBlink 530ms infinite;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .typing-cursor {
        animation: none;
        opacity: 0.5;
      }
      
      @keyframes fadeInWord {
        from, to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  `;
  document.head.appendChild(style);

  // Export to global scope
  window.TypingEffect = {
    type: typeText,
    typeFade: typeTextFade,
    reveal: revealText,
    clear: clearTyping,
    config: CONFIG
  };

  console.log('✍️ TypingEffect module loaded');

})();