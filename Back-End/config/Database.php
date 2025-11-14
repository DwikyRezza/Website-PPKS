<?php
// Back-End/config/Database.php

namespace Config;

use PDO;
use PDOException;
use Exception;

class Database {
    private $host = 'localhost';
    private $db_name = 'website-ppks';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            throw new Exception("Kesalahan Koneksi Database: " . $exception->getMessage());
        }

        return $this->conn;
    }
}
