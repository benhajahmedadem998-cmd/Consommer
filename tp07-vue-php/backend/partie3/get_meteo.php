<?php
// backend/partie3/get_meteo.php — Interroge Open-Meteo avec les coordonnées MySQL
require_once __DIR__ . '/../config/db.php';

$idVilleBrut = $_GET['id_ville'] ?? '';

if (!ctype_digit((string)$idVilleBrut)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Identifiant de ville invalide.'
    ]);
    exit;
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare(
        'SELECT v.id_ville, v.nom AS ville, v.latitude, v.longitude, p.nom AS pays
         FROM ville v
         INNER JOIN pays p ON v.id_pays = p.id_pays
         WHERE v.id_ville = :id_ville'
    );
    $stmt->execute([':id_ville' => (int)$idVilleBrut]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ville introuvable.'
        ]);
        exit;
    }

    $url = sprintf(
        'https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current=temperature_2m,apparent_temperature,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto',
        urlencode((string)$row['latitude']),
        urlencode((string)$row['longitude'])
    );

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false || $httpCode !== 200) {
        http_response_code(502);
        echo json_encode([
            'success' => false,
            'message' => "Erreur lors de l'appel à Open-Meteo."
        ]);
        exit;
    }

    $data = json_decode($response, true);

    echo json_encode([
        'success' => true,
        'ville' => [
            'id_ville' => (int)$row['id_ville'],
            'nom' => $row['ville'],
            'latitude' => (float)$row['latitude'],
            'longitude' => (float)$row['longitude'],
        ],
        'pays' => $row['pays'],
        'meteo' => [
            'temperature' => $data['current']['temperature_2m'] ?? null,
            'ressenti' => $data['current']['apparent_temperature'] ?? null,
            'temp_min' => $data['daily']['temperature_2m_min'][0] ?? null,
            'temp_max' => $data['daily']['temperature_2m_max'][0] ?? null,
            'vent' => $data['current']['wind_speed_10m'] ?? null,
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur PDO.'
    ]);
}
