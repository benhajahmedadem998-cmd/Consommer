<?php
// backend/partie2/get_villes.php — Villes associées à un pays (id_pays)
require_once __DIR__ . '/../config/db.php';

$idPaysBrut = $_GET['id_pays'] ?? '';

if (!ctype_digit((string)$idPaysBrut)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Identifiant de pays invalide.'
    ]);
    exit;
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare(
        'SELECT id_ville, nom, id_pays FROM ville WHERE id_pays = :id_pays ORDER BY nom ASC'
    );
    $stmt->execute([':id_pays' => (int)$idPaysBrut]);
    $villes = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'villes' => $villes
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Impossible de charger les villes.'
    ]);
}
