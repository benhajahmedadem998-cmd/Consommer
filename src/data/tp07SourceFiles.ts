export interface SourceFileItem {
  id: string;
  path: string;
  name: string;
  category: 'sql' | 'php' | 'vue';
  part: 'Commun' | 'Partie 1' | 'Partie 2' | 'Partie 3';
  description: string;
  code: string;
}

export const SQL_DATABASE_CODE = `-- database.sql — Base de données MySQL pour le TP 07
CREATE DATABASE IF NOT EXISTS tp07_geographie
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp07_geographie;

-- Table des pays
CREATE TABLE IF NOT EXISTS pays (
  id_pays INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Table des villes avec coordonnées géographiques (Partie 3)
CREATE TABLE IF NOT EXISTS ville (
  id_ville INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  id_pays INT NOT NULL,
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  CONSTRAINT fk_ville_pays
    FOREIGN KEY (id_pays) REFERENCES pays(id_pays)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Jeu de données initial
INSERT INTO pays (id_pays, nom) VALUES
  (1, 'Tunisie'),
  (2, 'France'),
  (3, 'Maroc'),
  (4, 'Italie');

INSERT INTO ville (nom, id_pays, latitude, longitude) VALUES
  -- Tunisie
  ('Djerba', 1, 33.875000, 10.857500),
  ('Douz',   1, 33.466300,  9.020300),
  ('Gabès',  1, 33.881500, 10.098200),
  ('Kef',    1, 36.174200,  8.704900),
  ('Sfax',   1, 34.740600, 10.760300),
  ('Tunis',  1, 36.806500, 10.181500),
  ('Zarzis', 1, 33.504000, 11.112200),
  -- France
  ('Lyon',      2, 45.764000, 4.835700),
  ('Marseille', 2, 43.296500, 5.369800),
  ('Paris',     2, 48.856600, 2.352200),
  -- Maroc
  ('Agadir',     3, 30.427800, -9.598100),
  ('Casablanca', 3, 33.573100, -7.589800),
  ('Marrakech',  3, 31.629500, -7.981100),
  -- Italie
  ('Milan', 4, 45.464200,  9.190000),
  ('Rome',  4, 41.902800, 12.496400);
`;

export const PHP_DB_CODE = `<?php
// backend/config/db.php — Connexion PDO MySQL + en-têtes JSON/CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function getPDO(): PDO {
    $host = 'localhost';
    $dbname = 'tp07_geographie';
    $user = 'root';
    $password = '';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    return new PDO($dsn, $user, $password, $options);
}
`;

export const PHP_P1_CODE = `<?php
// backend/partie1/rechercher_pays.php — Recherche d'un pays par id_pays
require_once __DIR__ . '/../config/db.php';

$idBrut = $_GET['id_pays'] ?? '';

// Validation côté serveur : entier strictement positif
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
`;

export const PHP_P2_PAYS_CODE = `<?php
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
`;

export const PHP_P2_VILLES_CODE = `<?php
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
`;

export const PHP_P3_PAYS_CODE = `<?php
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
`;

export const PHP_P3_VILLES_CODE = `<?php
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
`;

export const PHP_P3_METEO_CODE = `<?php
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
`;

export const VUE_NAV_CODE = `<!-- src/components/BarreNavigation.vue -->
<script setup>
defineProps({
  partieActive: {
    type: String,
    required: true,
    validator: (v) => ['partie1', 'partie2', 'partie3'].includes(v)
  }
});

const emit = defineEmits(['changer-partie']);

const onglets = [
  { id: 'partie1', libelle: 'Partie 1' },
  { id: 'partie2', libelle: 'Partie 2' },
  { id: 'partie3', libelle: 'Partie 3' }
];
</script>

<template>
  <header class="navbar">
    <div class="navbar-marque">
      <strong>Vue.js</strong>
      <span class="separateur">|</span>
      <span>Pays et villes</span>
    </div>

    <nav class="navbar-liens">
      <button
        v-for="onglet in onglets"
        :key="onglet.id"
        :class="{ actif: partieActive === onglet.id }"
        @click="emit('changer-partie', onglet.id)"
      >
        {{ onglet.libelle }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0b192c;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
}
.navbar-marque {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.separateur {
  color: #475569;
}
.navbar-liens {
  display: flex;
  gap: 0.5rem;
}
.navbar-liens button {
  background: transparent;
  border: none;
  color: #cbd5e1;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.navbar-liens button.actif {
  background-color: #059669;
  color: #ffffff;
}
</style>
`;

export const VUE_SELECT_CODE = `<!-- src/components/SelecteurListe.vue — Composant réutilisable (defineModel + props) -->
<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: Array, default: () => [] },
  champValeur: { type: String, required: true },
  champLibelle: { type: String, default: 'nom' },
  placeholder: { type: String, default: '-- Sélectionner --' },
  desactive: { type: Boolean, default: false }
});

// Liaison bidirectionnelle v-model (Chapitre 6 §3.4)
const modele = defineModel({ default: '' });
</script>

<template>
  <div class="champ">
    <label :for="id">{{ label }}</label>
    <select :id="id" v-model="modele" :disabled="desactive">
      <option value="">{{ placeholder }}</option>
      <option
        v-for="item in options"
        :key="item[champValeur]"
        :value="item[champValeur]"
      >
        {{ item[champLibelle] }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.champ {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}
select {
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: #ffffff;
  font-size: 0.95rem;
}
select:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
}
</style>
`;

export const VUE_CARTE_METEO_CODE = `<!-- src/components/CarteMeteo.vue — Composant de présentation pur -->
<script setup>
defineProps({
  ville: { type: String, required: true },
  pays: { type: String, required: true },
  temperature: { type: Number, required: true },
  ressenti: { type: Number, required: true },
  tempMin: { type: Number, required: true },
  tempMax: { type: Number, required: true },
  vent: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});
</script>

<template>
  <div class="resultat-meteo">
    <h3>{{ ville }} ({{ pays }})</h3>
    <p class="temperature">{{ temperature }} °C</p>
    <p class="details">
      Ressenti : {{ ressenti }} °C •
      Min : {{ tempMin }} °C •
      Max : {{ tempMax }} °C •
      Vent : {{ vent }} km/h
    </p>
    <p class="coordonnees">
      Coordonnées : {{ latitude }}, {{ longitude }}
    </p>
  </div>
</template>

<style scoped>
.resultat-meteo {
  text-align: center;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}
h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 0.35rem;
}
.temperature {
  font-size: 2.75rem;
  font-weight: 700;
  color: #0f4c81;
  margin: 0.25rem 0;
}
.details {
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: 0.35rem;
}
.coordonnees {
  font-size: 0.8rem;
  color: #64748b;
}
</style>
`;

export const VUE_P1_CODE = `<!-- src/components/Partie1Recherche.vue — API Fetch + validation -->
<script setup>
import { ref } from 'vue';

const API_BASE = 'http://localhost/tp07/backend/partie1';

const identifiant = ref('');
const erreur = ref('');
const paysTrouve = ref('');
const chargement = ref(false);

async function rechercherPays() {
  erreur.value = '';
  paysTrouve.value = '';

  const valeur = identifiant.value.trim();

  // Validation frontend : champ non vide
  if (valeur === '') {
    erreur.value = 'Veuillez saisir un identifiant de pays.';
    return; // Requête non envoyée
  }

  // Validation frontend : entier strict
  if (!/^\\d+$/.test(valeur)) {
    erreur.value = "L'identifiant doit être un nombre entier.";
    return; // Requête non envoyée
  }

  chargement.value = true;
  try {
    const reponse = await fetch(
      \`\${API_BASE}/rechercher_pays.php?id_pays=\${encodeURIComponent(valeur)}\`
    );
    const data = await reponse.json();

    if (!reponse.ok || !data.trouve) {
      erreur.value = data.message || "Le pays n'a pas été trouvé.";
      return;
    }

    paysTrouve.value = data.pays.nom;
  } catch (e) {
    erreur.value = 'Erreur de communication avec le serveur.';
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <section class="carte">
    <h2>Rechercher un pays par son identifiant</h2>

    <form @submit.prevent="rechercherPays">
      <div class="champ">
        <label for="id-pays">Identifiant du pays</label>
        <input
          id="id-pays"
          v-model="identifiant"
          type="text"
          placeholder="Ex : 1"
        />
      </div>

      <button type="submit" :disabled="chargement">
        {{ chargement ? 'Recherche...' : 'Rechercher' }}
      </button>
    </form>

    <div v-if="erreur" class="alerte-erreur">
      {{ erreur }}
    </div>

    <div v-if="paysTrouve" class="alerte-succes">
      Pays trouvé : <strong>{{ paysTrouve }}</strong>
    </div>
  </section>
</template>

<style scoped>
.carte {
  background: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}
h2 {
  margin-bottom: 1.25rem;
  font-size: 1.35rem;
  color: #0f172a;
}
.champ {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
input {
  padding: 0.65rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
button {
  background-color: #059669;
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.alerte-erreur {
  margin-top: 1rem;
  background-color: #dc2626;
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}
.alerte-succes {
  margin-top: 1rem;
  background-color: #059669;
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}
</style>
`;

export const VUE_P2_CODE = `<!-- src/components/Partie2PaysVilles.vue — Pays et villes avec Fetch -->
<script setup>
import { ref, watch, onMounted } from 'vue';
import SelecteurListe from './SelecteurListe.vue';

const API_BASE = 'http://localhost/tp07/backend/partie2';

const listePays = ref([]);
const listeVilles = ref([]);
const idPaysSelectionne = ref('');   // Aucun pays sélectionné au départ
const idVilleSelectionnee = ref(''); // Aucune ville sélectionnée par défaut
const erreur = ref('');

onMounted(async () => {
  try {
    const res = await fetch(\`\${API_BASE}/get_pays.php\`);
    const data = await res.json();
    listePays.value = data.pays || [];
  } catch (e) {
    erreur.value = 'Impossible de charger la liste des pays.';
  }
});

watch(idPaysSelectionne, async (nouvelIdPays) => {
  idVilleSelectionnee.value = '';
  listeVilles.value = [];

  if (!nouvelIdPays) return;

  try {
    const res = await fetch(
      \`\${API_BASE}/get_villes.php?id_pays=\${encodeURIComponent(nouvelIdPays)}\`
    );
    const data = await res.json();
    listeVilles.value = data.villes || [];
  } catch (e) {
    erreur.value = 'Impossible de charger les villes.';
  }
});
</script>

<template>
  <section class="carte">
    <h2>Pays et villes</h2>
    <p class="sous-titre">Sélectionnez un pays et une ville.</p>

    <SelecteurListe
      id="select-pays-p2"
      v-model="idPaysSelectionne"
      label="Pays"
      :options="listePays"
      champ-valeur="id_pays"
      placeholder="-- Choisir un pays --"
    />

    <SelecteurListe
      id="select-ville-p2"
      v-model="idVilleSelectionnee"
      label="Ville"
      :options="listeVilles"
      champ-valeur="id_ville"
      placeholder="-- Choisir une ville --"
      :desactive="!idPaysSelectionne"
    />

    <p v-if="erreur" class="erreur">{{ erreur }}</p>
  </section>
</template>

<style scoped>
.carte {
  background: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}
.sous-titre {
  color: #64748b;
  margin-bottom: 1.25rem;
}
.erreur {
  color: #dc2626;
  margin-top: 0.75rem;
}
</style>
`;

export const VUE_P3_CODE = `<!-- src/components/Partie3MeteoAxios.vue — Duplication avec Axios + Open-Meteo -->
<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import SelecteurListe from './SelecteurListe.vue';
import CarteMeteo from './CarteMeteo.vue';

const API_BASE = 'http://localhost/tp07/backend/partie3';

const listePays = ref([]);
const listeVilles = ref([]);
const idPaysSelectionne = ref('');
const idVilleSelectionnee = ref('');
const meteoInfo = ref(null);
const chargement = ref(false);
const erreur = ref('');

onMounted(async () => {
  try {
    const { data } = await axios.get(\`\${API_BASE}/get_pays.php\`);
    listePays.value = data.pays || [];
  } catch (e) {
    erreur.value = 'Impossible de charger les pays.';
  }
});

watch(idPaysSelectionne, async (nouvelIdPays) => {
  idVilleSelectionnee.value = '';
  listeVilles.value = [];
  meteoInfo.value = null;

  if (!nouvelIdPays) return;

  try {
    const { data } = await axios.get(\`\${API_BASE}/get_villes.php\`, {
      params: { id_pays: nouvelIdPays }
    });
    listeVilles.value = data.villes || [];
  } catch (e) {
    erreur.value = 'Impossible de charger les villes.';
  }
});

watch(idVilleSelectionnee, async (nouvelIdVille) => {
  meteoInfo.value = null;
  erreur.value = '';

  if (!nouvelIdVille) return;

  chargement.value = true;
  try {
    const { data } = await axios.get(\`\${API_BASE}/get_meteo.php\`, {
      params: { id_ville: nouvelIdVille }
    });
    meteoInfo.value = data;
  } catch (e) {
    erreur.value = 'Impossible de récupérer la météo.';
  } finally {
    chargement.value = false;
  }
});
</script>

<template>
  <section class="carte">
    <h2>Température de la ville</h2>

    <SelecteurListe
      id="select-pays-p3"
      v-model="idPaysSelectionne"
      label="Pays"
      :options="listePays"
      champ-valeur="id_pays"
      placeholder="-- Choisir un pays --"
    />

    <SelecteurListe
      id="select-ville-p3"
      v-model="idVilleSelectionnee"
      label="Ville"
      :options="listeVilles"
      champ-valeur="id_ville"
      placeholder="-- Choisir une ville --"
      :desactive="!idPaysSelectionne"
    />

    <p v-if="chargement" class="info">Chargement de la météo...</p>
    <p v-if="erreur" class="erreur">{{ erreur }}</p>

    <CarteMeteo
      v-if="meteoInfo"
      :ville="meteoInfo.ville.nom"
      :pays="meteoInfo.pays"
      :temperature="meteoInfo.meteo.temperature"
      :ressenti="meteoInfo.meteo.ressenti"
      :temp-min="meteoInfo.meteo.temp_min"
      :temp-max="meteoInfo.meteo.temp_max"
      :vent="meteoInfo.meteo.vent"
      :latitude="meteoInfo.ville.latitude"
      :longitude="meteoInfo.ville.longitude"
    />
  </section>
</template>

<style scoped>
.carte {
  background: #ffffff;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}
h2 {
  margin-bottom: 1.25rem;
}
.info {
  color: #475569;
  text-align: center;
}
.erreur {
  color: #dc2626;
  text-align: center;
}
</style>
`;

export const VUE_APP_CODE = `<!-- src/App.vue — Conteneur principal orchestrant les 3 parties -->
<script setup>
import { ref } from 'vue';
import BarreNavigation from './components/BarreNavigation.vue';
import Partie1Recherche from './components/Partie1Recherche.vue';
import Partie2PaysVilles from './components/Partie2PaysVilles.vue';
import Partie3MeteoAxios from './components/Partie3MeteoAxios.vue';

const partieActive = ref('partie1');

function changerPartie(nouvellePartie) {
  partieActive.value = nouvellePartie;
}
</script>

<template>
  <div class="page">
    <BarreNavigation
      :partie-active="partieActive"
      @changer-partie="changerPartie"
    />

    <main class="conteneur">
      <Partie1Recherche v-if="partieActive === 'partie1'" />
      <Partie2PaysVilles v-else-if="partieActive === 'partie2'" />
      <Partie3MeteoAxios v-else />
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f1f5f9;
}
.conteneur {
  max-width: 720px;
  margin: 2.5rem auto;
  padding: 0 1rem;
}
</style>
`;

export const TP07_SOURCE_FILES: SourceFileItem[] = [
  {
    id: 'vue-app',
    path: 'src/App.vue',
    name: 'App.vue',
    category: 'vue',
    part: 'Commun',
    description: 'Composant conteneur racine gérant la navigation entre Partie 1, Partie 2 et Partie 3.',
    code: VUE_APP_CODE,
  },
  {
    id: 'vue-nav',
    path: 'src/components/BarreNavigation.vue',
    name: 'BarreNavigation.vue',
    category: 'vue',
    part: 'Commun',
    description: 'Composant de présentation utilisant defineProps (avec validateur) et defineEmits.',
    code: VUE_NAV_CODE,
  },
  {
    id: 'vue-select',
    path: 'src/components/SelecteurListe.vue',
    name: 'SelecteurListe.vue',
    category: 'vue',
    part: 'Commun',
    description: 'Liste déroulante réutilisable avec liaison bidirectionnelle defineModel (Vue 3.4+).',
    code: VUE_SELECT_CODE,
  },
  {
    id: 'vue-p1',
    path: 'src/components/Partie1Recherche.vue',
    name: 'Partie1Recherche.vue',
    category: 'vue',
    part: 'Partie 1',
    description: 'Recherche d’un pays par identifiant avec validation stricte côté client et API Fetch.',
    code: VUE_P1_CODE,
  },
  {
    id: 'vue-p2',
    path: 'src/components/Partie2PaysVilles.vue',
    name: 'Partie2PaysVilles.vue',
    category: 'vue',
    part: 'Partie 2',
    description: 'Listes liées Pays et Villes chargées depuis MySQL via Fetch (aucune sélection par défaut).',
    code: VUE_P2_CODE,
  },
  {
    id: 'vue-p3',
    path: 'src/components/Partie3MeteoAxios.vue',
    name: 'Partie3MeteoAxios.vue',
    category: 'vue',
    part: 'Partie 3',
    description: 'Version dupliquée utilisant Axios pour interroger le backend PHP et afficher Open-Meteo.',
    code: VUE_P3_CODE,
  },
  {
    id: 'vue-meteo-card',
    path: 'src/components/CarteMeteo.vue',
    name: 'CarteMeteo.vue',
    category: 'vue',
    part: 'Partie 3',
    description: 'Composant de présentation pur affichant température, ressenti, min/max, vent et coordonnées.',
    code: VUE_CARTE_METEO_CODE,
  },
  {
    id: 'sql-db',
    path: 'database.sql',
    name: 'database.sql',
    category: 'sql',
    part: 'Commun',
    description: 'Schéma MySQL des tables pays et ville (avec latitude/longitude) et données initiales.',
    code: SQL_DATABASE_CODE,
  },
  {
    id: 'php-db',
    path: 'backend/config/db.php',
    name: 'db.php',
    category: 'php',
    part: 'Commun',
    description: 'Connexion PDO MySQL avec requêtes préparées activées et en-têtes JSON/CORS.',
    code: PHP_DB_CODE,
  },
  {
    id: 'php-p1',
    path: 'backend/partie1/rechercher_pays.php',
    name: 'rechercher_pays.php',
    category: 'php',
    part: 'Partie 1',
    description: 'Endpoint PHP PDO recherchant un pays par son identifiant entier.',
    code: PHP_P1_CODE,
  },
  {
    id: 'php-p2-pays',
    path: 'backend/partie2/get_pays.php',
    name: 'partie2/get_pays.php',
    category: 'php',
    part: 'Partie 2',
    description: 'Endpoint PHP PDO retournant tous les pays triés au format JSON.',
    code: PHP_P2_PAYS_CODE,
  },
  {
    id: 'php-p2-villes',
    path: 'backend/partie2/get_villes.php',
    name: 'partie2/get_villes.php',
    category: 'php',
    part: 'Partie 2',
    description: 'Endpoint PHP PDO filtrant les villes par id_pays.',
    code: PHP_P2_VILLES_CODE,
  },
  {
    id: 'php-p3-pays',
    path: 'backend/partie3/get_pays.php',
    name: 'partie3/get_pays.php',
    category: 'php',
    part: 'Partie 3',
    description: 'Endpoint PHP dupliqué pour la Partie 3 (liste des pays).',
    code: PHP_P3_PAYS_CODE,
  },
  {
    id: 'php-p3-villes',
    path: 'backend/partie3/get_villes.php',
    name: 'partie3/get_villes.php',
    category: 'php',
    part: 'Partie 3',
    description: 'Endpoint PHP dupliqué retournant les villes avec latitude et longitude.',
    code: PHP_P3_VILLES_CODE,
  },
  {
    id: 'php-p3-meteo',
    path: 'backend/partie3/get_meteo.php',
    name: 'partie3/get_meteo.php',
    category: 'php',
    part: 'Partie 3',
    description: 'Lit les coordonnées de la ville en base PDO puis interroge l’API Open-Meteo via cURL.',
    code: PHP_P3_METEO_CODE,
  },
];
