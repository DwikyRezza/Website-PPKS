<?php
// Back-End/models/TrackingLog.php

namespace Models;

use Exception;
use PDO;

class TrackingLog extends BaseModel {
    protected $table_name = 'tracking_log';

    public function logStep(int $laporanId, int $stepId, string $status, ?int $adminId = null): bool {
        $checkQuery = "SELECT id FROM " . $this->table_name . " WHERE laporan_id = ? AND step_id = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->execute([$laporanId, $stepId]);

        if ($checkStmt->rowCount() > 0) {
            $query = "UPDATE " . $this->table_name . " SET status = ?, admin_id = ?, completed_at = NOW() WHERE laporan_id = ? AND step_id = ?";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$status, $adminId, $laporanId, $stepId]);
        } else {
            $query = "INSERT INTO " . $this->table_name . " (laporan_id, step_id, status, admin_id) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$laporanId, $stepId, $status, $adminId]);
        }
    }
    
    public function getLogsByLaporanId(int $laporanId): array {
        $query = "SELECT * FROM " . $this->table_name . " WHERE laporan_id = ? ORDER BY step_id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$laporanId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}