<?php
// Back-End/controllers/MonitoringController.php

namespace Controllers;

use Models\Laporan;
use Models\TrackingLog;
use Services\Sanitize;

class MonitoringController {
    private $laporanModel;
    private $trackingModel;
    private $dummyTimeline;

    public function __construct() {
        $this->laporanModel = new Laporan();
        $this->trackingModel = new TrackingLog();
        $this->loadDummyTimeline();
    }

    private function loadDummyTimeline() {
        // Daftar langkah sesuai front-end/logika
        $this->dummyTimeline = [
            1 => ['title' => 'Form telah ditemukan', 'desc' => 'Laporan Anda telah berhasil ditemukan dalam sistem dan siap untuk diproses oleh tim Satgas PPKS.', 'icon' => '✓'],
            2 => ['title' => 'Form terkirim', 'desc' => 'Form pelaporan telah berhasil dikirimkan ke tim Satgas PPKS untuk verifikasi awal dan pengecekan kelengkapan data.', 'icon' => '→'],
            3 => ['title' => 'Pengiriman identitas korban', 'desc' => 'Data identitas korban telah diterima dengan aman dan akan dijaga kerahasiaannya sesuai prosedur Satgas PPKS.', 'icon' => '⚠'],
            4 => ['title' => 'Konfirmasi Bukti & Saksi', 'desc' => 'Bukti pendukung dan keterangan saksi telah dikonfirmasi serta divalidasi oleh tim investigasi.', 'icon' => '📋'],
            5 => ['title' => 'Validasi Laporan', 'desc' => 'Laporan telah divalidasi secara menyeluruh dan memenuhi semua syarat untuk proses lanjutan ke tahap penanganan.', 'icon' => '✓'],
            6 => ['title' => 'Konseling Dengan Korban', 'desc' => 'Sesi konseling dengan psikolog profesional telah dijadwalkan dan sedang berlangsung untuk mendampingi korban.', 'icon' => '👥'],
            7 => ['title' => 'Tindak Lanjut', 'desc' => 'Proses tindak lanjut sesuai Standard Operating Procedure (SOP) telah dilaksanakan oleh tim terkait.', 'icon' => '⏳'],
            8 => ['title' => 'Selesai', 'desc' => 'Laporan telah selesai diproses secara tuntas. Terima kasih atas kepercayaan Anda kepada Satgas PPKS.', 'icon' => '🎉']
        ];
    }
    
    public function getReportStatus(string $kode) {
        $kode = Sanitize::cleanInput(strtoupper($kode));
        if (!Sanitize::required($kode)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Kode laporan wajib diisi.']);
            return;
        }

        $report = $this->laporanModel->findByKodeLaporan($kode);

        if (!$report) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => "Kode Laporan \"$kode\" tidak ditemukan."]);
            return;
        }
        
        // Cek log tracking untuk menemukan langkah terakhir yang sukses
        $logs = $this->trackingModel->getLogsByLaporanId($report['id']);
        
        $currentStepId = 1; // Default: ditemukan
        if (!empty($logs)) {
            foreach ($logs as $log) {
                if ($log['status'] === 'SUCCESS') {
                    $currentStepId = max($currentStepId, (int)$log['step_id']);
                }
            }
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $report['kode_laporan'],
                'laporanId' => $report['id'], // ID internal database
                'createdAt' => $report['tanggal_laporan'],
                'currentStepId' => $currentStepId,
                'status' => $report['status_laporan'],
            ]
        ]);
    }

    public function getTimelineSteps(int $completedStepId) {
        $steps = [];
        $isFinished = false;
        
        // Ambil semua langkah hingga completedStepId
        foreach ($this->dummyTimeline as $id => $stepData) {
            if ($id < $completedStepId) {
                // SUCCESS: Langkah yang sudah dilewati
                $status = 'success';
            } elseif ($id == $completedStepId) {
                // LOADING/FAILED: Langkah saat ini
                if ($id == 8) {
                    $status = 'success'; // Step 8 selalu selesai/failed
                    $isFinished = true;
                } else {
                    $status = 'loading'; // Jika belum 8, status masih loading
                }
            } else {
                // Belum dicapai, berhenti
                break;
            }
            
            $steps[] = [
                'id' => $id,
                'title' => $stepData['title'],
                'description' => $stepData['desc'],
                'status' => $status,
                'icon' => $stepData['icon']
            ];
            
            if ($status === 'loading') {
                $isFinished = false;
                break;
            }
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'steps' => $steps,
                'isCompleted' => $isFinished
            ]
        ]);
    }
}