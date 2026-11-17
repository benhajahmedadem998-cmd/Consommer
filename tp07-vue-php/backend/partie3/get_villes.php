<?php
// backend/partie3/get_villes.php — Villes avec latitude et longitude
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
        'SELECT id_ville, nom, id_pays, latitude, longitude
         FROM ville
         WHERE id_pays = :id_pays
         ORDER BY nom ASC'
    );
    $stmt->execute([':id_pays' => (int)$idPaysBrut]);

    echo json_encode([
        'success' => true,
        'villes' => $stmt->fetchAll()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors du chargement des villes.'
    ]);
}
