// ============================================
// TEMANKU CHATBOT - MAIN MODULE (FINAL FIX)
// Mental Health Support Chatbot
// ============================================
(function () {
  "use strict";

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  let isOpen = false;
  let chatStartTime = null;
  let interventionTriggered = false;
  let messageCount = 0;

  // ============================================
  // CREATE CHATBOT MODAL
  // ============================================
  function createChatbotModal() {
    const modal = document.createElement("div");
    modal.id = "temanku-chatbot-modal";
    modal.className = "temanku-modal";
    modal.innerHTML = `
      <!-- Welcome Screen -->
      <div class="temanku-welcome" id="temanku-welcome">
        <div class="temanku-welcome-content">
          <div class="temanku-wave-animation">
            👋
          </div>
          <h2>Hai! Saya TemanKu 💙</h2>
          <p>Aku di sini untuk mendengarkan kamu.</p>
          <p class="temanku-subtitle">Cerita apa pun, aku siap mendengar tanpa menghakimi.</p>
          <div class="temanku-welcome-buttons">
            <button class="btn btn-primary btn-lg" id="temanku-start-chat">
              💬 Mulai Berbincang
            </button>
            <button class="btn btn-outline-secondary" id="temanku-close-welcome">
              Nanti Saja
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Interface -->
      <div class="temanku-chat" id="temanku-chat" style="display: none;">
        <div class="temanku-header">
          <div class="temanku-header-info">
            <div class="temanku-avatar">🤖</div>
            <div class="temanku-header-text">
              <h3>TemanKu</h3>
              <span class="temanku-status">Online</span>
            </div>
          </div>
          <button class="temanku-close-btn" id="temanku-close-chat">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="temanku-messages" id="temanku-messages"></div>

        <div class="temanku-typing" id="temanku-typing" style="display: none;">
          <div class="temanku-typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="temanku-typing-text">TemanKu sedang mengetik...</span>
        </div>

        <div class="temanku-input-container">
          <input type="text" class="temanku-input" id="temanku-input" placeholder="Ketik pesan di sini..." maxlength="500">
          <button class="temanku-send-btn" id="temanku-send-btn">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // ============================================
  // OPEN/CLOSE
  // ============================================
  function openChatbot() {
    if (isOpen) return;
    const modal = document.getElementById("temanku-chatbot-modal");
    if (!modal) createChatbotModal();
    
    document.getElementById("temanku-chatbot-modal").style.display = "flex";
    document.getElementById("temanku-welcome").style.display = "flex";
    document.getElementById("temanku-chat").style.display = "none";
    
    isOpen = true;
    initEventListeners();
  }

  function closeChatbot() {
    const modal = document.getElementById("temanku-chatbot-modal");
    if (modal) modal.style.display = "none";
    isOpen = false;
  }

  // ============================================
  // START CHAT
  // ============================================
  function startChat() {
    document.getElementById("temanku-welcome").style.display = "none";
    document.getElementById("temanku-chat").style.display = "flex";
    
    chatStartTime = Date.now();
    messageCount = 0;
    interventionTriggered = false;
    
    if (window.GeminiAPI) window.GeminiAPI.resetConversation();
    
    addBotMessage("Hai! Aku TemanKu 💙 Aku di sini untuk mendengarkan. Mau cerita apa hari ini?");
    
    const input = document.getElementById("temanku-input");
    if (input) setTimeout(() => input.focus(), 100);
    
    startTimerMonitoring();
  }

  // ============================================
  // ADD MESSAGE
  // ============================================
  function addMessage(text, sender = "bot") {
    const messagesContainer = document.getElementById("temanku-messages");
    if (!messagesContainer) return null;

    const messageDiv = document.createElement("div");
    messageDiv.className = `temanku-message temanku-message-${sender}`;

    const time = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    messageDiv.innerHTML = `
      <div class="temanku-message-content">
        ${sender === "bot" ? '<div class="temanku-message-avatar">🤖</div>' : ""}
        <div class="temanku-message-bubble">
          <p>${safeText}</p>
          <span class="temanku-message-time">${time}</span>
        </div>
        ${sender === "user" ? '<div class="temanku-message-avatar">👤</div>' : ""}
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);

    return messageDiv;
  }

  function addBotMessage(text) {
    return addMessage(text, "bot");
  }

  function addUserMessage(text) {
    messageCount++;
    return addMessage(text, "user");
  }

  // ============================================
  // SEND USER MESSAGE - ULTRA FIXED
  // ============================================
  async function sendUserMessage() {
    const input = document.getElementById("temanku-input");
    const typing = document.getElementById("temanku-typing");
    
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addUserMessage(message);
    input.value = "";

    // Show typing
    if (typing) typing.style.display = "flex";

    // SAFETY: Force hide after 10 seconds
    const safetyTimer = setTimeout(() => {
      if (typing) typing.style.display = "none";
      console.log("⚠️ Safety: typing force hidden");
    }, 10000);

    try {
      // Check API
      if (!window.GeminiAPI) {
        throw new Error("GeminiAPI not loaded");
      }

      console.log("📤 Sending:", message);

      // Call API
      const response = await window.GeminiAPI.sendMessage(message);

      console.log("📥 Response:", response);

      // ALWAYS hide typing (success)
      if (typing) typing.style.display = "none";
      clearTimeout(safetyTimer);

      // Handle response
      if (response.error) {
        addBotMessage(response.text || "Maaf, ada gangguan 🙏");
        return;
      }

      if (response.isCrisis || response.blocked) {
        addBotMessage(response.text);
        setTimeout(() => showCrisisIntervention(), 1000);
        return;
      }

      addBotMessage(response.text || "...");

    } catch (error) {
      // ALWAYS hide typing (error)
      if (typing) typing.style.display = "none";
      clearTimeout(safetyTimer);
      
      console.error("❌ Error:", error);
      
      if (error.message === "GeminiAPI not loaded") {
        addBotMessage("Maaf, sistem belum siap. Refresh ya? 🙏");
      } else {
        addBotMessage("Maaf, terjadi kesalahan. Coba lagi ya? 🙏");
      }
    }
  }

  // ============================================
  // TIMER MONITORING (10 minutes)
  // ============================================
  function startTimerMonitoring() {
    const checkInterval = setInterval(() => {
      if (!isOpen || !chatStartTime) {
        clearInterval(checkInterval);
        return;
      }

      const elapsed = (Date.now() - chatStartTime) / 1000 / 60;

      if (elapsed >= 10 && !interventionTriggered) {
        interventionTriggered = true;
        clearInterval(checkInterval);
        showTimeIntervention();
      }
    }, 60000);
  }

  function showTimeIntervention() {
    addBotMessage("⏰ Kita sudah mengobrol selama 10 menit.");
    setTimeout(() => {
      addBotMessage("Sepertinya masalahmu cukup berat. Aku khawatir aku kurang bisa membantu. Mungkin kamu perlu bicara dengan seseorang yang lebih ahli? 🤗");
    }, 1500);
    setTimeout(() => {
      showInterventionOptions();
    }, 3000);
  }

  // ============================================
  // INTERVENTION OPTIONS
  // ============================================
  function showInterventionOptions() {
    const messagesContainer = document.getElementById("temanku-messages");
    if (!messagesContainer) return;

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "temanku-intervention-options";
    optionsDiv.innerHTML = `
      <div class="temanku-message temanku-message-bot">
        <div class="temanku-message-content">
          <div class="temanku-message-avatar">🤖</div>
          <div class="temanku-message-bubble">
            <p>Pilih yang kamu butuhkan:</p>
            <div class="temanku-options-buttons">
              <button class="btn btn-primary btn-block" onclick="window.TemanKuChatbot.showCrisisContacts()">
                📞 Hubungi Psikolog
              </button>
              <button class="btn btn-secondary btn-block" onclick="window.TemanKuChatbot.startBreathingExercise()">
                🧘 Latihan Pernapasan
              </button>
              <button class="btn btn-outline-secondary btn-block" onclick="window.TemanKuChatbot.continueChat()">
                💬 Tetap Lanjut Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(optionsDiv);
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }

  function showCrisisIntervention() {
    addBotMessage("Aku detect kamu mungkin sedang dalam kondisi yang berat. Aku sangat khawatir dengan kamu 💙");
    setTimeout(() => showInterventionOptions(), 1500);
  }

  // ============================================
  // CRISIS CONTACTS
  // ============================================
  function showCrisisContacts() {
    const messagesContainer = document.getElementById("temanku-messages");
    if (!messagesContainer) return;

    const contactsDiv = document.createElement("div");
    contactsDiv.className = "temanku-crisis-contacts";
    contactsDiv.innerHTML = `
      <div class="temanku-message temanku-message-bot">
        <div class="temanku-message-content">
          <div class="temanku-message-avatar">🤖</div>
          <div class="temanku-message-bubble">
            <p><strong>📞 Hubungi Profesional:</strong></p>
            <div class="temanku-contact-list">
              <div class="temanku-contact-item">
                <i class="fas fa-phone"></i>
                <div>
                  <strong>Hotline Kemenkes</strong>
                  <a href="tel:119">119 (ext 8)</a>
                </div>
              </div>
              <div class="temanku-contact-item">
                <i class="fab fa-whatsapp"></i>
                <div>
                  <strong>WhatsApp PPKS</strong>
                  <a href="https://wa.me/6282188467793" target="_blank">+62 821-8846-7793</a>
                </div>
              </div>
              <div class="temanku-contact-item">
                <i class="fas fa-envelope"></i>
                <div>
                  <strong>Email Support</strong>
                  <a href="mailto:support@ppks.ac.id">support@ppks.ac.id</a>
                </div>
              </div>
            </div>
            <p class="temanku-note">💙 Kamu tidak sendiri. Bantuan profesional siap membantu.</p>
          </div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(contactsDiv);
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }

  // ============================================
  // BREATHING EXERCISE
  // ============================================
  function startBreathingExercise() {
    addBotMessage("Baik, ayo kita coba latihan pernapasan bersama. Ini akan membantu menenangkan pikiran 🧘");
    setTimeout(() => {
      if (window.BreathingExercise) {
        window.BreathingExercise.start();
      } else {
        addBotMessage("Maaf, fitur latihan pernapasan belum tersedia. Tapi kamu bisa coba: Tarik napas 4 detik, tahan 4 detik, hembuskan 4 detik 🌬️");
      }
    }, 1500);
  }

  // ============================================
  // CONTINUE CHAT
  // ============================================
  function continueChat() {
    addBotMessage("Oke, aku akan tetap di sini mendengarkan kamu 💙 Cerita terus ya!");
    chatStartTime = Date.now();
    interventionTriggered = false;
    startTimerMonitoring();
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function initEventListeners() {
    const startBtn = document.getElementById("temanku-start-chat");
    const closeWelcomeBtn = document.getElementById("temanku-close-welcome");
    const closeChatBtn = document.getElementById("temanku-close-chat");
    const sendBtn = document.getElementById("temanku-send-btn");
    const input = document.getElementById("temanku-input");

    if (startBtn) startBtn.onclick = startChat;
    if (closeWelcomeBtn) closeWelcomeBtn.onclick = closeChatbot;
    if (closeChatBtn) closeChatBtn.onclick = handleCloseChat;
    if (sendBtn) sendBtn.onclick = sendUserMessage;
    
    if (input) {
      input.onkeypress = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendUserMessage();
        }
      };
    }
  }

  function handleCloseChat() {
    if (confirm("Yakin ingin keluar dari chat? Percakapan akan tersimpan.")) {
      closeChatbot();
    }
  }

  // ============================================
  // EXPORT PUBLIC API
  // ============================================
  window.TemanKuChatbot = {
    open: openChatbot,
    close: closeChatbot,
    showCrisisContacts: showCrisisContacts,
    startBreathingExercise: startBreathingExercise,
    continueChat: continueChat,
  };

  console.log("✅ TemanKu Chatbot Module Loaded (FIXED FINAL)");
})();