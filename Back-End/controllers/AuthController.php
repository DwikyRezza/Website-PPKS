<?php
// Back-End/controllers/AuthController.php

namespace Controllers;

use Models\admin;
use Services\Sanitize;
use Exception;

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new admin();
    }

    public function login() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['username']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Username dan Password wajib diisi.']);
                return;
            }

            $username = Sanitize::cleanInput($data['username']);
            $password = $data['password'];

            $admin = $this->userModel->login($username, $password);

            if ($admin) {
                if (session_status() == PHP_SESSION_NONE) {
                    session_start();
                }
                $_SESSION['user_id'] = $admin['id'];
                $_SESSION['username'] = $admin['username'];
                $_SESSION['role'] = $admin['role'];
                $_SESSION['nama_lengkap'] = $admin['nama_lengkap'];
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Login berhasil!',
                    'user' => $admin
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Username atau Password salah.']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Kesalahan server saat login: ' . $e->getMessage()]);
        }
    }

    public function logout() {
        session_start();
        session_unset();
        session_destroy();

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Logout berhasil.']);
    }

    public static function checkAuth(): bool {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        return isset($_SESSION['user_id']);
    }
    
    public static function requireAuth() {
        if (!self::checkAuth()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Akses ditolak. Harap login.']);
            exit();
        }
    }
}