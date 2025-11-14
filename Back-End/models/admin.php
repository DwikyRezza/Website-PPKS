<?php
// Back-End/models/User.php

namespace Models;

class admin extends BaseModel {
    protected $table_name = 'admin';

    public function login(string $username, string $password): array|false {
        $admin = $this->findOneBy('username', $username);

        if ($admin && password_verify($password, $admin['password'])) {
            unset($admin['password']);
            return $admin;
        }

        return false;
    }
}