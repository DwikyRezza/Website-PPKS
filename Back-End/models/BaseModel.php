<?php
// Back-End/models/BaseModel.php

namespace Models;

use Config\Database;
use PDO;

/**
 * Kelas Dasar (Base Model) yang berisi fungsionalitas umum yang diwariskan.
 */
abstract class BaseModel {
    protected $conn;
    protected $table_name; 
    protected $primary_key = 'id';

    public function __construct() {
        $database = new Database();
        try {
            $this->conn = $database->getConnection();
        } catch (\Exception $e) { // Menggunakan \Exception untuk global namespace
            die(json_encode(['success' => false, 'message' => $e->getMessage()]));
        }
    }

    public function findAll(): array {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY " . $this->primary_key . " DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): array|false {
        $query = "SELECT * FROM " . $this->table_name . " WHERE " . $this->primary_key . " = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findOneBy(string $column, $value): array|false {
        $query = "SELECT * FROM " . $this->table_name . " WHERE {$column} = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$value]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function query(string $query, array $params = []): array {
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function delete(int $id): bool {
        $query = "DELETE FROM " . $this->table_name . " WHERE " . $this->primary_key . " = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}