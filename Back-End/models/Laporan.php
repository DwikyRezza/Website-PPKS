<?php
// Back-End/models/Laporan.php

namespace Models;

use Exception;
use PDO;

class Laporan extends BaseModel {
    protected $table_name = 'laporan';

    private function generateUuidV4(): string {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
            mt_rand( 0, 0xffff ),
            mt_rand( 0, 0x0fff ) | 0x4000,
            mt_rand( 0, 0x3fff ) | 0x8000,
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );
    }
    
    private function generateReportCode(): string {
        $prefix = 'PPKS' . date('y');
        $timestamp = (new \DateTime())->format('mdHis'); // Menggunakan \DateTime
        return $prefix . substr($timestamp, 0, 8);
    }

    public function createLaporan(array $data) {
        $data['uuid_anonim'] = $this->generateUuidV4();
        $data['kode_laporan'] = $this->generateReportCode();
        
        $fields = [
            'uuid_anonim', 'kode_laporan', 'is_darurat', 'korban_status', 'tingkat_khawatir', 
            'gender_korban', 'usia_korban', 'is_disabilitas', 'jenis_disabilitas', 
            'pelaku_hubungan', 'waktu_kejadian', 'lokasi_kejadian', 'deskripsi', 
            'email_korban', 'whatsapp_korban', 'status_laporan'
        ];
        
        $placeholders = implode(', ', array_map(fn($f) => ":$f", $fields));
        $columns = implode(', ', $fields);

        $query = "INSERT INTO " . $this->table_name . " ($columns) VALUES ($placeholders)";

        $stmt = $this->conn->prepare($query);
        
        try {
            $bindData = [];
            foreach ($fields as $field) {
                if ($field === 'is_darurat' || $field === 'is_disabilitas') {
                    $bindData[":$field"] = $data[$field] ? 1 : 0;
                } else {
                    $bindData[":$field"] = $data[$field] ?? null;
                }
            }
            
            $stmt->execute($bindData);
            return $data['kode_laporan'];
        } catch (\Exception $e) { // Menggunakan \Exception
            throw new \Exception("Laporan gagal disimpan: " . $e->getMessage());
        }
    }
    
    public function findByKodeLaporan(string $kode): array|false {
        $query = "SELECT id, kode_laporan, tanggal_laporan, status_laporan FROM " . $this->table_name . " WHERE kode_laporan = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$kode]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}