// ============================================
// DUMMY REPORT DATABASE
// 🚨 CRITICAL: HAPUS FILE INI SAAT PRODUCTION!
// File ini HANYA untuk testing frontend
// Di production, data akan dari backend API
// ============================================

const DUMMY_REPORTS = {
  
  // ========================================
  // ✅ SCENARIO 1: SUCCESS - Semua berhasil (8 steps)
  // ID: GNJ34
  // ========================================
  'GNJ34': {
    id: 'GNJ34',
    status: 'completed',
    reporterName: 'Anonymous',
    createdAt: '2025-01-15T14:30:00',
    steps: [
      {
        id: 1,
        title: 'Form telah ditemukan',
        description: 'Laporan Anda telah berhasil ditemukan dalam sistem dan siap untuk diproses oleh tim Satgas PPKS.',
        status: 'success',
        delay: 4000, // 4 detik
        icon: '✓'
      },
      {
        id: 2,
        title: 'Form terkirim',
        description: 'Form pelaporan telah berhasil dikirimkan ke tim Satgas PPKS untuk verifikasi awal dan pengecekan kelengkapan data.',
        status: 'success',
        delay: 4000,
        icon: '→'
      },
      {
        id: 3,
        title: 'Pengiriman identitas korban',
        description: 'Data identitas korban telah diterima dengan aman dan akan dijaga kerahasiaannya sesuai prosedur Satgas PPKS.',
        status: 'success',
        delay: 4000,
        icon: '⚠'
      },
      {
        id: 4,
        title: 'Konfirmasi Bukti & Saksi',
        description: 'Bukti pendukung dan keterangan saksi telah dikonfirmasi serta divalidasi oleh tim investigasi.',
        status: 'success',
        delay: 4000,
        icon: '📋'
      },
      {
        id: 5,
        title: 'Validasi Laporan',
        description: 'Laporan telah divalidasi secara menyeluruh dan memenuhi semua syarat untuk proses lanjutan ke tahap penanganan.',
        status: 'success',
        delay: 4000,
        icon: '✓'
      },
      {
        id: 6,
        title: 'Konseling Dengan Korban',
        description: 'Sesi konseling dengan psikolog profesional telah dijadwalkan dan sedang berlangsung untuk mendampingi korban.',
        status: 'success',
        delay: 4000,
        icon: '👥'
      },
      {
        id: 7,
        title: 'Tindak Lanjut',
        description: 'Proses tindak lanjut sesuai Standard Operating Procedure (SOP) telah dilaksanakan oleh tim terkait.',
        status: 'success',
        delay: 4000,
        icon: '⏳'
      },
      {
        id: 8,
        title: 'Selesai',
        description: 'Laporan telah selesai diproses secara tuntas. Terima kasih atas kepercayaan Anda kepada Satgas PPKS.',
        status: 'success',
        delay: 4000,
        icon: '🎉'
      }
    ]
  },

  // ========================================
  // ⚠️ SCENARIO 2: STUCK di Step 2
  // ID: ABC12
  // ========================================
  'ABC12': {
    id: 'ABC12',
    status: 'in_progress',
    reporterName: 'Anonymous',
    createdAt: '2025-01-16T09:15:00',
    steps: [
      {
        id: 1,
        title: 'Form telah ditemukan',
        description: 'Laporan Anda telah berhasil ditemukan dalam sistem dan siap untuk diproses oleh tim Satgas PPKS.',
        status: 'success',
        delay: 4000,
        icon: '✓'
      },
      {
        id: 2,
        title: 'Menunggu verifikasi form',
        description: 'Form sedang dalam antrian verifikasi oleh tim Satgas PPKS. Mohon menunggu, proses ini biasanya memakan waktu 1-3 hari kerja.',
        status: 'loading',
        delay: 999999, // Infinite loading (stuck)
        icon: '⏸'
      }
      // Step selanjutnya TIDAK MUNCUL karena stuck di step 2
    ]
  },

  // ========================================
  // ⚠️ SCENARIO 3: STUCK di Step 3
  // ID: DEF56
  // ========================================
  'DEF56': {
    id: 'DEF56',
    status: 'in_progress',
    reporterName: 'Anonymous',
    createdAt: '2025-01-16T11:20:00',
    steps: [
      {
        id: 1,
        title: 'Form telah ditemukan',
        description: 'Laporan Anda telah berhasil ditemukan dalam sistem dan siap untuk diproses oleh tim Satgas PPKS.',
        status: 'success',
        delay: 4000,
        icon: '✓'
      },
      {
        id: 2,
        title: 'Form terkirim',
        description: 'Form pelaporan telah berhasil dikirimkan ke tim Satgas PPKS untuk verifikasi awal dan pengecekan kelengkapan data.',
        status: 'success',
        delay: 4000,
        icon: '→'
      },
      {
        id: 3,
        title: 'Menunggu identitas korban',
        description: 'Sedang menunggu kelengkapan data identitas korban. Mohon cek email Anda untuk instruksi lebih lanjut.',
        status: 'loading',
        delay: 999999, // Infinite loading (stuck)
        icon: '⏸'
      }
      // Step selanjutnya TIDAK MUNCUL karena stuck di step 3
    ]
  },

  // ========================================
  // ⚠️ SCENARIO 4: STUCK di Step 4
  // ID: XYZ89
  // ========================================
  'XYZ89': {
    id: 'XYZ89',
    status: 'in_progress',
    reporterName: 'Anonymous',
    createdAt: '2025-01-16T13:45:00',
    steps: [
      {
        id: 1,
        title: 'Form telah ditemukan',
        description: 'Laporan Anda telah berhasil ditemukan dalam sistem dan siap untuk diproses oleh tim Satgas PPKS.',
        status: 'success',
        delay: 4000,
        icon: '✓'
      },
      {
        id: 2,
        title: 'Form terkirim',
        description: 'Form pelaporan telah berhasil dikirimkan ke tim Satgas PPKS untuk verifikasi awal dan pengecekan kelengkapan data.',
        status: 'success',
        delay: 4000,
        icon: '→'
      },
      {
        id: 3,
        title: 'Pengiriman identitas korban',
        description: 'Data identitas korban telah diterima dengan aman dan akan dijaga kerahasiaannya sesuai prosedur Satgas PPKS.',
        status: 'success',
        delay: 4000,
        icon: '⚠'
      },
      {
        id: 4,
        title: 'Menunggu konfirmasi bukti',
        description: 'Sedang menunggu verifikasi bukti pendukung dan keterangan saksi oleh tim investigasi. Proses ini dapat memakan waktu hingga 7 hari kerja.',
        status: 'loading',
        delay: 999999, // Infinite loading (stuck)
        icon: '⏸'
      }
      // Step selanjutnya TIDAK MUNCUL karena stuck di step 4
    ]
  }

};

// ============================================
// UTILITY FUNCTIONS (Helper)
// ============================================

/**
 * Get report by ID
 * @param {string} reportId - Kode laporan (e.g., 'GNJ34')
 * @returns {object|null} Report data atau null jika tidak ditemukan
 */
function getReportById(reportId) {
  return DUMMY_REPORTS[reportId] || null;
}

/**
 * Check if report exists
 * @param {string} reportId - Kode laporan
 * @returns {boolean}
 */
function reportExists(reportId) {
  return reportId in DUMMY_REPORTS;
}

/**
 * Get all report IDs (untuk testing)
 * @returns {string[]} Array of report IDs
 */
function getAllReportIds() {
  return Object.keys(DUMMY_REPORTS);
}

// ============================================
// CONSOLE LOG untuk Testing
// (Comment out atau hapus di production)
// ============================================
console.log('📊 DUMMY REPORTS - Available Test IDs:');
console.log('┌────────────────────────────────────────┐');
console.log('│ ✅ SUCCESS (all 8 steps): GNJ34        │');
console.log('│ ⚠️  STUCK at Step 2: ABC12             │');
console.log('│ ⚠️  STUCK at Step 3: DEF56             │');
console.log('│ ⚠️  STUCK at Step 4: XYZ89             │');
console.log('│ ❌ NOT FOUND (error test): XXXX        │');
console.log('└────────────────────────────────────────┘');

// Export untuk ES6 modules (jika pakai)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DUMMY_REPORTS, getReportById, reportExists, getAllReportIds };
}