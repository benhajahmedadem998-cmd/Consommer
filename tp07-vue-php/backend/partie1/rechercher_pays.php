<?php
// backend/partie1/rechercher_pays.php — Recherche d'un pays par id_pays
require_once __DIR__ . '/../config/db.php';

$idBrut = $_GET['id_pays'] ?? '';

if (!ctype_digit((string)$idBrut)) {
    http_response_code(400);
    echo json_encode([
        'trouve' => false,
        'message' => "L'identifiant doit être un nombre entier."
    ]);
    exit;
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare('SELECT id_pays, nom FROM pays WHERE id_pays = :id');
    $stmt->execute([':id' => (int)$idBrut]);
    $pays = $stmt->fetch();

    if (!$pays) {
        http_response_code(404);
        echo json_encode([
            'trouve' => false,
            'message' => "Le pays n'a pas été trouvé."
        ]);
        exit;
    }

    echo json_encode([
        'trouve' => true,
        'pays' => $pays
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'trouve' => false,
        'message' => 'Erreur serveur lors de la recherche.'
    ]);
}
