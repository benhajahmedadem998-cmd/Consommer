<?php
// backend/partie3/get_pays.php — Dupliqué pour la Partie 3 (Axios)
require_once __DIR__ . '/../config/db.php';

try {
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT id_pays, nom FROM pays ORDER BY nom ASC');
    echo json_encode([
        'success' => true,
        'pays' => $stmt->fetchAll()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors du chargement des pays.'
    ]);
}
