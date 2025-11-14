<?php
// Back-End/controllers/LaporanController.php

namespace Controllers;

use Models\Laporan;
use Models\TrackingLog;
use Services\Sanitize;
use Config\Database;
use PDO;
use Exception;

class LaporanController {
    private $db;
    private $laporanModel;
    private $trackingModel;

    public function __construct() {
        AuthController::requireAuth();
        $this->laporanModel = new Laporan();
        $this->trackingModel = new TrackingLog();
        $this->db = (new Database())->getConnection();
    }
    
    public function index() {
        $query = "SELECT 
                    l.id, l.kode_laporan, l.tingkat_khawatir, l.email_korban, l.tanggal_laporan, l.status_laporan
                  FROM laporan l
                  ORDER BY l.tanggal_laporan DESC";
        
        try {
            $stmt = $this->db->query($query);
            $laporan = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $laporan]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal mengambil data laporan: ' . $e->getMessage()]);
        }
    }

    public function show(int $id) {
        $laporan = $this->laporanModel->findById($id);

        if ($laporan) {
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $laporan]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Laporan tidak ditemukan.']);
        }
    }

    public function updateCaseStatus(int $id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $newStatus = Sanitize::cleanInput($data['newStatus'] ?? '');
        $targetStep = (int)($data['targetStep'] ?? 0);
        $adminNotes = Sanitize::cleanInput($data['adminNotes'] ?? '');

        if (!Sanitize::required($newStatus) || $targetStep === 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Status baru dan ID Langkah wajib diisi.']);
            return;
        }

        try {
            $this->db->beginTransaction();
            $adminId = $_SESSION['user_id'] ?? null;
            $trackingStatus = ($newStatus === 'DITOLAK') ? 'FAILED' : 'SUCCESS';

            $queryLaporan = "UPDATE laporan SET status_laporan = :status, updated_at = NOW() WHERE id = :id";
            $stmtLaporan = $this->db->prepare($queryLaporan);
            $stmtLaporan->execute([':status' => $newStatus, ':id' => $id]);

            $this->trackingModel->logStep($id, $targetStep, $trackingStatus, $adminId);
            
            $existingCase = $this->db->prepare("SELECT laporan_id FROM kasus_analisis WHERE laporan_id = ?");
            $existingCase->execute([$id]);
            
            if ($existingCase->rowCount() == 0 && $newStatus != 'DRAFT') {
                $queryKasus = "INSERT INTO kasus_analisis (laporan_id, admin_id, hasil_verifikasi) 
                               VALUES (?, ?, ?)";
                $stmtKasus = $this->db->prepare($queryKasus);
                $stmtKasus->execute([
                    $id,
                    $adminId,
                    ($newStatus === 'DITOLAK') ? 'TIDAK_VALID' : 'VALID'
                ]);
            }
            
            $this->db->commit();
            
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Status dan Case Tracking berhasil diperbarui.']);
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal memperbarui kasus: ' . $e->getMessage()]);
        }
    }
    
    public function delete(int $id) {
        try {
            if ($this->laporanModel->delete($id)) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Laporan berhasil dihapus.']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Laporan tidak ditemukan.']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus laporan: ' . $e->getMessage()]);
        }
    }

    public function getStats() {
        // Implementasi untuk pelapor.html / dashboard.html
        http_response_code(501); 
        echo json_encode(['success' => false, 'message' => 'Endpoint statistik belum diimplementasikan.']);
    }
}