-- Nama Database: sigap_ppks

-- 1. Tabel: users (Pengganti tabel 'admin' Anda)
-- Digunakan untuk Autentikasi Admin/Petugas Satgas.
CREATE TABLE IF NOT EXISTS users (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Kunci utama User.',
  username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Username unik untuk login Admin/Petugas.',
  password VARCHAR(255) NOT NULL COMMENT 'Hash password (WAJIB BCrypt).',
  nama_lengkap VARCHAR(255) NOT NULL COMMENT 'Nama lengkap Admin/Petugas.',
  role ENUM('superadmin', 'petugas') NOT NULL DEFAULT 'petugas' COMMENT 'Peran pengguna untuk hak akses.',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan akun.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'Data akun Admin dan Petugas Satgas.';

-- Data Awal (Admin Default: username 'admin', password 'password123')
INSERT INTO `users` (`username`, `password`, `nama_lengkap`, `role`) VALUES
('admin', '$2y$10$Q7w/H5L2Kz9R.6r8N/1OqO.e7H4oO9sOQ/E4/wJ4T7hN0xW4jG5gQ', 'Administrator Satgas PPKS', 'superadmin');


-- 2. Tabel: laporan (Database Laporan - Data Input Awal Anonim)
-- Menggantikan tabel 'laporan' Anda, dengan penambahan UUIDv4 (SRS MR 1) dan kolom yang lengkap dari form lapor.html.
CREATE TABLE IF NOT EXISTS laporan (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Kunci utama laporan internal.',
  uuid_anonim CHAR(36) NOT NULL UNIQUE COMMENT 'ID Anonim unik (UUIDv4) untuk kerahasiaan SRS MR 1.',
  kode_laporan VARCHAR(50) NOT NULL UNIQUE COMMENT 'Kode unik eksternal (PPKSxxxxxx) untuk Case Tracking.',
  
  -- Data Form Lapor.html Step 1 & 2
  is_darurat TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Status: 1=Darurat, 0=Tidak Darurat.',
  korban_status ENUM('saya', 'oranglain') NOT NULL COMMENT 'Status pelapor: Korban sendiri atau Orang Lain.',
  tingkat_khawatir ENUM('sedikit', 'khawatir', 'sangat') NOT NULL COMMENT 'Tingkat kekhawatiran pelapor.',
  
  -- Data Form Lapor.html Step 3 & 5
  gender_korban ENUM('laki-laki', 'perempuan', 'lainnya') NOT NULL COMMENT 'Gender korban.',
  usia_korban VARCHAR(20) NOT NULL COMMENT 'Rentang usia korban (misal: 18-25).',
  is_disabilitas TINYINT(1) DEFAULT 0 COMMENT 'Status disabilitas: 1=Ya, 0=Tidak.',
  jenis_disabilitas VARCHAR(100) DEFAULT NULL COMMENT 'Jenis disabilitas korban.',
  
  -- Data Form Lapor.html Step 4
  pelaku_hubungan VARCHAR(100) NOT NULL COMMENT 'Hubungan pelaku dengan korban (misal: Teman, Guru).',
  waktu_kejadian VARCHAR(50) NOT NULL COMMENT 'Waktu kejadian (misal: Pagi, Malam).',
  lokasi_kejadian VARCHAR(100) NOT NULL COMMENT 'Lokasi kejadian (misal: Kampus, Rumah Tangga).',
  deskripsi TEXT NOT NULL COMMENT 'Detail kronologi kejadian.',
  
  -- Kontak & Bukti
  email_korban VARCHAR(100) DEFAULT NULL COMMENT 'Email kontak (opsional).',
  whatsapp_korban VARCHAR(20) DEFAULT NULL COMMENT 'Nomor WhatsApp kontak (opsional).',
  bukti_path VARCHAR(255) DEFAULT NULL COMMENT 'Path ke bukti terlampir (gambar/audio).',
  
  -- Status Penanganan
  status_laporan ENUM('DRAFT', 'DITERIMA', 'DIPROSES', 'PERLINDUNGAN', 'SELESAI', 'DITOLAK') NOT NULL DEFAULT 'DRAFT' COMMENT 'Status penanganan kasus saat ini.',
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu laporan dibuat.',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu laporan terakhir diupdate.',
  PRIMARY KEY (`id`),
  INDEX idx_kode (kode_laporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'Data laporan awal dari pelapor.';


-- 3. Tabel: tracking_log (Pengganti tabel 'tracking_laporan' Anda)
-- Menyimpan log setiap tahapan progres, digunakan untuk animasi di monitoring.js.
CREATE TABLE IF NOT EXISTS tracking_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Kunci utama log tracking.',
    laporan_id INT UNSIGNED NOT NULL COMMENT 'Kunci asing ke tabel laporan.',
    step_id TINYINT NOT NULL COMMENT 'ID Langkah Timeline (1-8).',
    admin_id INT UNSIGNED DEFAULT NULL COMMENT 'Admin/Petugas yang memproses langkah ini.',
    
    -- Status harus sesuai dengan yang diolah di monitoring.js
    status ENUM('PENDING', 'SUCCESS', 'LOADING', 'FAILED') DEFAULT 'SUCCESS' COMMENT 'Status langkah untuk tampilan monitoring.',
    
    catatan_admin TEXT DEFAULT NULL COMMENT 'Catatan tambahan dari Admin Satgas untuk langkah ini.',
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu langkah ini diselesaikan/dicatat.',
    
    FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'Log perkembangan 8 langkah Case Tracking.';


-- 4. Tabel: kasus_analisis (Mirip Database Kasus SRS - Hasil Verifikasi Admin)
-- Data ini diisi setelah Admin memverifikasi, menganalisis, dan mengklasifikasi kasus.
CREATE TABLE IF NOT EXISTS kasus_analisis (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Kunci utama analisis kasus.',
    laporan_id INT UNSIGNED NOT NULL UNIQUE COMMENT 'Kunci asing UNIK ke laporan yang sudah diverifikasi.',
    admin_id INT UNSIGNED DEFAULT NULL COMMENT 'Admin/Petugas yang bertanggung jawab (Case Assignment).',
    judul_kasus VARCHAR(255) COMMENT 'Judul Kasus Formal yang diberikan Satgas.',
    klasifikasi_ai ENUM('FISIK', 'VERBAL', 'NON_VERBAL', 'DIGITAL', 'LAINNYA') DEFAULT NULL COMMENT 'Klasifikasi Jenis Kekerasan (SRS).',
    hasil_verifikasi ENUM('VALID', 'TIDAK_VALID', 'PENDING') DEFAULT 'PENDING' COMMENT 'Hasil Verifikasi Formal Admin.',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu analisis dibuat.',
    
    FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'Data verifikasi, klasifikasi, dan Case Assignment.';


-- 5. Tabel: posts (Blogspot Admin)
-- Untuk mengelola konten Blogspot (buat-postingan.html).
CREATE TABLE IF NOT EXISTS posts (
  id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Kunci utama postingan.',
  admin_id INT(11) UNSIGNED NOT NULL COMMENT 'Admin/Petugas yang membuat post.',
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE COMMENT 'URL slug untuk SEO.',
  konten LONGTEXT NOT NULL COMMENT 'Isi lengkap postingan.',
  kategori VARCHAR(100) DEFAULT 'Umum',
  thumbnail_url VARCHAR(255) DEFAULT NULL COMMENT 'Path file thumbnail.',
  status ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'Data artikel blog edukasi.';


-- 6. Tabel: chat_history (Riwayat Interaksi Chatbot - SRS)
-- Menyimpan log Chatbot AI dan skor Prediksi Mental Health.
CREATE TABLE IF NOT EXISTS chat_history (
    id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Kunci utama log chat.',
    session_id VARCHAR(100) NOT NULL COMMENT 'ID Sesi unik per interaksi pengguna anonim.',
    role ENUM('USER', 'AI') NOT NULL COMMENT 'Peran yang mengirim pesan.',
    message TEXT NOT NULL COMMENT 'Isi pesan.',
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    predict_mental_health_score DECIMAL(4,2) DEFAULT NULL COMMENT 'Skor risiko psikologis (SRS MR 3).',
    PRIMARY KEY (`id`),
    INDEX (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'Riwayat QnA dan prediksi mental health.';