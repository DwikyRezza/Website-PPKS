<?php
// Back-End/controllers/LaporApiController.php

namespace Controllers;

use Models\Laporan;
use Services\Sanitize;
use Exception;

class LaporApiController {
    private $laporanModel;

    public function __construct() {
        $this->laporanModel = new Laporan();
    }

    public function submit() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Format data tidak valid (JSON diharapkan).']);
            return;
        }

        $requiredKeys = [
            'korban', 'kehawatiran', 'genderKorban', 'usiaKorban',
            'pelakuKekerasan', 'waktuKejadian', 'lokasiKejadian', 
            'detailKejadian'
        ];
        
        foreach ($requiredKeys as $key) {
            if (!isset($data[$key]) || !Sanitize::required((string)$data[$key])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Field '$key' wajib diisi."]);
                return;
            }
        }
        
        $sanitizedData = [];
        $isDisabilitas = ($data['disabilitasStatus'] ?? 'tidak') === 'ya';

        $sanitizedData['korban_status'] = Sanitize::cleanInput($data['korban']);
        $sanitizedData['tingkat_khawatir'] = Sanitize::cleanInput($data['kehawatiran']);
        $sanitizedData['gender_korban'] = Sanitize::cleanInput($data['genderKorban']);
        $sanitizedData['usia_korban'] = Sanitize::cleanInput($data['usiaKorban']);
        $sanitizedData['pelaku_hubungan'] = Sanitize::cleanInput($data['pelakuKekerasan']);
        $sanitizedData['waktu_kejadian'] = Sanitize::cleanInput($data['waktuKejadian']);
        $sanitizedData['lokasi_kejadian'] = Sanitize::cleanInput($data['lokasiKejadian']);
        $sanitizedData['deskripsi'] = Sanitize::cleanInput($data['detailKejadian']);
        $sanitizedData['is_darurat'] = ($data['statusDarurat'] ?? 'tidak') === 'darurat';
        
        $sanitizedData['email_korban'] = Sanitize::cleanInput($data['emailKorban'] ?? '');
        $sanitizedData['whatsapp_korban'] = Sanitize::cleanInput($data['whatsappKorban'] ?? '');
        $sanitizedData['is_disabilitas'] = $isDisabilitas;
        $sanitizedData['jenis_disabilitas'] = $isDisabilitas ? Sanitize::cleanInput($data['jenisDisabilitas'] ?? '') : null;
        
        $sanitizedData['status_laporan'] = 'DRAFT'; 

        try {
            $kodeLaporan = $this->laporanModel->createLaporan($sanitizedData);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Pengaduan berhasil dicatat.',
                'kode_laporan' => $kodeLaporan
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan laporan: ' . $e->getMessage()]);
        }
    }
}