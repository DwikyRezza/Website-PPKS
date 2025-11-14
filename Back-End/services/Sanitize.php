<?php
// Back-End/services/Sanitize.php

namespace Services;

class Sanitize {

    public static function cleanInput(string $data): string {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8'); 
        return $data;
    }

    public static function required($value): bool {
        return !empty($value) && is_string($value) && trim($value) !== '';
    }
}