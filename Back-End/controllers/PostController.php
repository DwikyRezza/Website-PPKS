<?php
// Back-End/controllers/PostController.php

namespace Controllers;

use Models\Post;
use Services\Sanitize;
use Exception;

class PostController {
    private $postModel;

    public function __construct() {
        $this->postModel = new Post();
        AuthController::requireAuth(); 
    }
    
    public function index() {
        $query = "SELECT p.*, u.nama_lengkap as admin_name 
                  FROM posts p 
                  JOIN admin u ON p.admin_id = u.id 
                  ORDER BY p.created_at DESC";
        
        try {
            $posts = $this->postModel->query($query);
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $posts]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal mengambil data posts: ' . $e->getMessage()]);
        }
    }

    public function show(int $id) {
        $post = $this->postModel->findById($id); 
        
        if ($post) {
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $post]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Post tidak ditemukan.']);
        }
    }

    public function create() {
        $judul = Sanitize::cleanInput($_POST['postJudul'] ?? '');
        $konten = Sanitize::cleanInput($_POST['postIsi'] ?? '');
        
        if (!Sanitize::required($judul) || !Sanitize::required($konten) || empty($_FILES['imageUpload']['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Judul, Isi, dan Gambar wajib diisi.']);
            return;
        }

        $uploadDir = 'uploads/thumbnails/';
        $thumbnailUrl = null;
        if ($_FILES['imageUpload']['error'] == UPLOAD_ERR_OK) {
            $targetDir = ROOT_PATH . '/public/' . $uploadDir;

            if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
            
            $fileExt = pathinfo($_FILES['imageUpload']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('post_') . '.' . $fileExt;
            $destination = $targetDir . $fileName;

            if (move_uploaded_file($_FILES['imageUpload']['tmp_name'], $destination)) {
                $thumbnailUrl = '/' . $uploadDir . $fileName;
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal mengupload gambar.']);
                return;
            }
        }
        
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $judul))); 
        
        $data = [
            'admin_id' => $_SESSION['user_id'],
            'judul' => $judul,
            'slug' => $slug,
            'konten' => $konten,
            'thumbnail_url' => $thumbnailUrl,
            'status' => 'PUBLISHED',
        ];

        try {
            if ($this->postModel->create($data)) {
                http_response_code(201);
                echo json_encode(['success' => true, 'message' => 'Postingan berhasil dibuat.', 'slug' => $slug]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal menyimpan postingan ke database.']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Kesalahan database: ' . $e->getMessage()]);
        }
    }

    public function update(int $id) {
        // Implementasi disederhanakan untuk menggunakan POST dengan file upload
        $judul = Sanitize::cleanInput($_POST['postJudul'] ?? '');
        $konten = Sanitize::cleanInput($_POST['postIsi'] ?? '');
        $currentThumbnail = $_POST['currentThumbnail'] ?? null;
        
        if (!Sanitize::required($judul) || !Sanitize::required($konten)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Judul dan Isi wajib diisi.']);
            return;
        }

        $thumbnailUrl = $currentThumbnail;

        if (!empty($_FILES['imageUpload']['name']) && $_FILES['imageUpload']['error'] == UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/thumbnails/';
            $targetDir = ROOT_PATH . '/public/' . $uploadDir;
            
            if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
            
            $fileExt = pathinfo($_FILES['imageUpload']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('post_') . '.' . $fileExt;
            $destination = $targetDir . $fileName;

            if (move_uploaded_file($_FILES['imageUpload']['tmp_name'], $destination)) {
                $thumbnailUrl = '/' . $uploadDir . $fileName;
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal mengupload gambar baru.']);
                return;
            }
        }
        
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $judul))); 
        
        $data = [
            'judul' => $judul,
            'slug' => $slug,
            'konten' => $konten,
            'thumbnail_url' => $thumbnailUrl,
            'status' => 'PUBLISHED',
        ];

        try {
            if ($this->postModel->update($id, $data)) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Postingan berhasil diperbarui.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal memperbarui postingan.']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Kesalahan database saat update: ' . $e->getMessage()]);
        }
    }

    public function delete(int $id) {
        $post = $this->postModel->findById($id);

        try {
            if ($this->postModel->delete($id)) {
                if ($post && $post['thumbnail_url'] && file_exists(ROOT_PATH . '/public' . $post['thumbnail_url'])) {
                    unlink(ROOT_PATH . '/public' . $post['thumbnail_url']);
                }

                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Postingan berhasil dihapus.']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Gagal menghapus postingan atau post tidak ditemukan.']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus: ' . $e->getMessage()]);
        }
    }
}