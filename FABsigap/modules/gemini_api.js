// ============================================
// GEMINI API INTEGRATION - FIXED VERSION
// Updated according to official Gemini API docs
// ============================================

(function () {
  "use strict";

  // ============================================
  // CONFIGURATION
  // ============================================
  const API_KEY = "AIzaSyBgXlErcKTZQxgDu5Q9FDWPQ7i-zOe3-w8";
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

  let conversationHistory = [];

  // ============================================
  // SAFETY SETTINGS
  // ============================================
  const safetySettings = [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ];

  // ============================================
  // SYSTEM PROMPT
  // ============================================
  const systemPrompt = `Kamu adalah TemanKu, chatbot pendamping kesehatan mental yang empati dan supportif untuk mahasiswa.

    KARAKTERMU:
    - Warm, friendly, dan non-judgmental
    - Gunakan bahasa Indonesia casual tapi sopan (gaya anak muda)
    - Dengarkan dengan empati tanpa menghakimi
    - Jangan memberikan diagnosa medis
    - Jika detect tanda-tanda krisis, arahkan ke profesional

    CARA RESPON:
    - Pendek & padat (2-3 kalimat max) tergantung dari konteks masalah dari user
    - masalah semakin rumit tulisan harus benar-benar sesuai
    - Empati dan validating feelings
    - Ajukan pertanyaan follow-up yang gentle
    - Gunakan emoji dengan bijak 💙 (1-2 per pesan)
    - Hindari jargon psikologi yang berat

    CONTOH:
    User: "Aku lagi sedih banget"
    Kamu: "Aku paham kamu sedang merasa sedih 💙 Boleh cerita lebih lanjut apa yang bikin kamu sedih?"

    User: "Nilai aku jelek semua"
    Kamu: "Nilai yang nggak sesuai harapan emang bikin down ya. Tapi ingat, nilai bukan penentu segalanya. Mau cerita lebih lanjut?"`;

  // ============================================
  // SEND MESSAGE (FIXED ACCORDING TO DOCS)
  // ============================================
  async function sendMessage(userMessage) {
    try {
      // Add user message to history
      conversationHistory.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      // Build request according to official docs
      const requestBody = {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: conversationHistory,
        safetySettings: safetySettings,
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      };

      // Call API with correct headers
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", response.status, errorText);

        if (response.status === 429) {
          return {
            text: "Maaf, terlalu banyak request. Tunggu sebentar ya? 🙏",
            error: true,
          };
        }

        return {
          text: "Maaf, ada masalah teknis. Coba lagi ya? 🙏",
          error: true,
        };
      }

      const data = await response.json();
      console.log("✅ Gemini Response:", data);

      // Check safety blocks
      if (data.promptFeedback?.blockReason) {
        console.warn("🚨 Blocked:", data.promptFeedback.blockReason);
        return {
          text: "Aku detect kamu mungkin sedang dalam kondisi yang berat. Aku sangat khawatir dengan kamu 💙 Boleh aku sarankan untuk bicara dengan profesional?",
          isCrisis: true,
          blocked: true,
        };
      }

      // Get response
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from API");
      }

      const candidate = data.candidates[0];
      const botResponse = candidate.content.parts[0].text;

      // Add to history
      conversationHistory.push({
        role: "model",
        parts: [{ text: botResponse }],
      });

      // Check crisis
      const isCrisis = detectCrisisKeywords(userMessage);

      return {
        text: botResponse,
        isCrisis: isCrisis,
        blocked: false,
      };
    } catch (error) {
      console.error("❌ Error:", error);

      // Remove failed message
      if (conversationHistory.length > 0) {
        conversationHistory.pop();
      }

      return {
        text: "Maaf, aku lagi ada gangguan. Coba lagi ya? 🙏",
        error: true,
      };
    }
  }

  // ============================================
  // CRISIS DETECTION
  // ============================================
  function detectCrisisKeywords(message) {
    const keywords = [
      // Frasa langsung
      "bunuh diri",
      "bunuh dir",
      "mau bunuh diri",
      "pengen bunuh diri",
      "aku mau bunuh diri",
      "aku pengen bunuh diri",
      "aku ingin bunuh diri",
      "aku mau mati",
      "aku pengen mati",
      "aku ingin mati",
      "pengen mati",
      "ingin mati",
      "mau mati",
      "mati aja",
      "mati saja",
      "lebih baik mati",
      "mending mati",
      "mendingan mati",
      "mau ngakhirin hidup",
      "ngakhirin hidup",
      "akhiri hidup",
      "mengakhiri hidup",
      "aku mau ngakhirin semuanya",
      "aku pengen ngilang selamanya",
      "aku mau pergi selamanya",

      // Variasi emosional
      "cape hidup",
      "capek hidup",
      "lelah hidup",
      "bosan hidup",
      "hidup gak ada arti",
      "hidup gak berarti",
      "hidup hampa",
      "hidup sia sia",
      "hidup ini percuma",
      "gak mau hidup lagi",
      "tidak mau hidup lagi",
      "gak pengen hidup",
      "tidak ingin hidup",
      "hidupku hancur",
      "hidupku gak ada gunanya",
      "aku gagal",
      "aku gak berguna",
      "aku cuma beban",
      "aku beban keluarga",
      "aku pengen ngilang",
      "aku mau hilang",
      "aku ingin menghilang",
      "pengen hilang aja",
      "mending aku gak ada",
      "andai aku gak lahir",
      "seandainya aku gak lahir",
      "aku nyerah",
      "aku menyerah",
      "udah gak kuat",
      "udah gak tahan",
      "gak sanggup lagi",
      "udah cukup",
      "cukup sampai sini",
      "aku capek banget",
      "aku udah lelah",

      // Aksi melukai diri
      "lukai diri",
      "sakiti diri",
      "nyakitin diri",
      "nyilet tangan",
      "iris tangan",
      "sayat tangan",
      "sayat pergelangan",
      "potong urat",
      "minum obat banyak",
      "minum racun",
      "makan racun",
      "terjun dari",
      "loncat dari",
      "loncat jembatan",
      "loncat gedung",
      "jatuhin diri",
      "tabrak aku",
      "tabrakin diri",
      "nyebur ke sungai",
      "tidur selamanya",

      // Bentuk campuran atau tidak langsung
      "hidupku udah berakhir",
      "aku udah selesai",
      "aku udah gak mau apa apa",
      "biarin aja aku mati",
      "biarin aku pergi",
      "aku gak pantas hidup",
      "aku pengen tenang selamanya",
      "aku mau tidur selamanya",
      "aku mau istirahat selamanya",
      "aku gak bisa lanjut",
      "aku udah gak tahan hidup kayak gini",
      "aku gak mau bangun lagi",
      "aku pengen diem selamanya",
      "semoga aku gak bangun lagi",
      "aku udah gak peduli",
      "aku pengen bebas dari semua ini",
      "semua udah gak ada artinya",
      "aku cuma pengen semuanya selesai",

      // Bahasa gaul atau disingkat
      "pgn mati",
      "pgn ngilang",
      "capek bgt hidup",
      "lelah bgt hidup",
      "udh gk kuat",
      "udh gk tahan",
      "hidup gk ada gunanya",
      "hidup sia2",
      "pgn bunuh diri",
      "mau bunuh dri",
      "mau bundir aja",
      "ngakhirin aja",
      "cukup smpe sini",
      "gak guna aku hidup",
      "aku useless",
      "aku worthless",
      "cape pengen bundir aja",

      // Bahasa Inggris (tetap penting untuk konteks bilingual)
      "suicide",
      "want to die",
      "i want to die",
      "kill myself",
      "end my life",
      "i can’t live anymore",
      "life is meaningless",
      "i’m done",
      "i’m tired of living",
      "no reason to live",
      "i hate my life",
      "let me die",
      "wish i could die",
      "life sucks",
      "i’m hopeless",
    ];

    const lower = message.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  }

  // ============================================
  // RESET
  // ============================================
  function resetConversation() {
    conversationHistory = [];
    console.log("✅ Conversation reset");
  }

  // ============================================
  // GET HISTORY
  // ============================================
  function getHistory() {
    return [...conversationHistory];
  }

  // ============================================
  // EXPORT
  // ============================================
  window.GeminiAPI = {
    sendMessage: sendMessage,
    resetConversation: resetConversation,
    getHistory: getHistory,
    detectCrisisKeywords: detectCrisisKeywords,
  };

  console.log("✅ Gemini API Module Loaded (Fixed)");
  console.log("📡 Using model: gemini-2.0-flash-exp");
  console.log("🔑 API Key:", API_KEY.substring(0, 10) + "...");
})();
