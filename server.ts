import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PAYS_DATA, VILLES_DATA } from './src/data/tp07Database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function createServer() {
  const app = express();
  app.use(express.json());

  // Partie 2 & 3 : Récupérer tous les pays (ordre alphabétique)
  app.get('/api/pays', (_req, res) => {
    const sorted = [...PAYS_DATA].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    res.json({
      success: true,
      pays: sorted,
    });
  });

  // Partie 1 : Rechercher un pays par son identifiant entier
  app.get('/api/pays/:id', (req, res) => {
    const rawId = req.params.id;
    if (!/^\d+$/.test(rawId)) {
      res.status(400).json({
        success: false,
        message: "L'identifiant doit être un nombre entier positif.",
      });
      return;
    }

    const idPays = Number.parseInt(rawId, 10);
    const pays = PAYS_DATA.find((p) => p.id_pays === idPays);

    if (!pays) {
      res.status(404).json({
        success: false,
        message: `Aucun pays trouvé pour l'identifiant ${idPays}.`,
      });
      return;
    }

    res.json({
      success: true,
      pays,
    });
  });

  // Partie 2 & 3 : Récupérer les villes associées à un pays (champ id_pays)
  app.get('/api/villes', (req, res) => {
    const rawIdPays = String(req.query.id_pays ?? '');
    if (!/^\d+$/.test(rawIdPays)) {
      res.status(400).json({
        success: false,
        message: 'Le paramètre id_pays doit être un entier valide.',
      });
      return;
    }

    const idPays = Number.parseInt(rawIdPays, 10);
    const villes = VILLES_DATA
      .filter((v) => v.id_pays === idPays)
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

    res.json({
      success: true,
      villes,
    });
  });

  // Partie 3 : Interroger Open-Meteo côté serveur à partir des coordonnées de la ville
  app.get('/api/meteo', async (req, res) => {
    const rawIdVille = String(req.query.id_ville ?? '');
    if (!/^\d+$/.test(rawIdVille)) {
      res.status(400).json({
        success: false,
        message: 'Le paramètre id_ville doit être un entier valide.',
      });
      return;
    }

    const idVille = Number.parseInt(rawIdVille, 10);
    const ville = VILLES_DATA.find((v) => v.id_ville === idVille);

    if (!ville) {
      res.status(404).json({
        success: false,
        message: 'Ville introuvable dans la base de données.',
      });
      return;
    }

    const pays = PAYS_DATA.find((p) => p.id_pays === ville.id_pays);

    const openMeteoUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(ville.latitude)}` +
      `&longitude=${encodeURIComponent(ville.longitude)}` +
      `&current=temperature_2m,apparent_temperature,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min` +
      `&timezone=auto`;

    try {
      const response = await fetch(openMeteoUrl);
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }
      const weatherData = await response.json();

      res.json({
        success: true,
        ville: {
          id_ville: ville.id_ville,
          nom: ville.nom,
          latitude: ville.latitude,
          longitude: ville.longitude,
        },
        pays: pays ? pays.nom : '',
        meteo: {
          temperature: weatherData.current?.temperature_2m ?? null,
          ressenti: weatherData.current?.apparent_temperature ?? null,
          temp_min: weatherData.daily?.temperature_2m_min?.[0] ?? null,
          temp_max: weatherData.daily?.temperature_2m_max?.[0] ?? null,
          vent: weatherData.current?.wind_speed_10m ?? null,
          unite_temperature: weatherData.current_units?.temperature_2m ?? '°C',
          unite_vent: weatherData.current_units?.wind_speed_10m ?? 'km/h',
          heure_mesure: weatherData.current?.time ?? null,
        },
      });
    } catch (err) {
      console.error('Erreur Open-Meteo:', err);
      res.status(502).json({
        success: false,
        message: "Impossible de récupérer les données météorologiques depuis Open-Meteo.",
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur TP 07 actif sur http://localhost:${PORT}`);
  });
}

createServer();
