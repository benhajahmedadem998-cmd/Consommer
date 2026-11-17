<?php
// backend/partie2/get_pays.php — Liste de tous les pays en JSON
require_once __DIR__ . '/../config/db.php';

try {
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT id_pays, nom FROM pays ORDER BY nom ASC');
    $pays = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'pays' => $pays
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Impossible de charger les pays.'
    ]);
}
