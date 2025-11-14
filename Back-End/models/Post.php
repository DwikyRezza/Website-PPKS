<?php
// Back-End/models/Post.php

namespace Models;

use PDO;
use Exception;

class Post extends BaseModel {
    protected $table_name = 'posts';

    public function create(array $data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (admin_id, judul, slug, konten, thumbnail_url, status, kategori)
                  VALUES (:admin_id, :judul, :slug, :konten, :thumbnail_url, :status, :kategori)";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':admin_id', $data['admin_id']);
        $stmt->bindParam(':judul', $data['judul']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':konten', $data['konten']);
        $stmt->bindParam(':thumbnail_url', $data['thumbnail_url']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':kategori', $data['kategori'] ?? 'Umum');

        return $stmt->execute();
    }

    public function update(int $id, array $data) {
        $query = "UPDATE " . $this->table_name . " SET 
                  judul = :judul, 
                  slug = :slug, 
                  konten = :konten, 
                  thumbnail_url = :thumbnail_url, 
                  status = :status 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':judul', $data['judul']);
        $stmt->bindParam(':slug', $data['slug']);
        $stmt->bindParam(':konten', $data['konten']);
        $stmt->bindParam(':thumbnail_url', $data['thumbnail_url']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }
}