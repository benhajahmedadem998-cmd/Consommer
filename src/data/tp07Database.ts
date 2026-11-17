export interface PaysRecord {
  id_pays: number;
  nom: string;
}

export interface VilleRecord {
  id_ville: number;
  nom: string;
  id_pays: number;
  latitude: number;
  longitude: number;
}

export const PAYS_DATA: PaysRecord[] = [
  { id_pays: 1, nom: 'Tunisie' },
  { id_pays: 2, nom: 'France' },
  { id_pays: 3, nom: 'Maroc' },
  { id_pays: 4, nom: 'Italie' },
  { id_pays: 5, nom: 'Espagne' },
  { id_pays: 6, nom: 'Japon' },
];

export const VILLES_DATA: VilleRecord[] = [
  // Tunisie (exact list from TP 07 screenshot)
  { id_ville: 1, nom: 'Djerba', id_pays: 1, latitude: 33.875, longitude: 10.8575 },
  { id_ville: 2, nom: 'Douz', id_pays: 1, latitude: 33.4663, longitude: 9.0203 },
  { id_ville: 3, nom: 'Gabès', id_pays: 1, latitude: 33.8815, longitude: 10.0982 },
  { id_ville: 4, nom: 'Kef', id_pays: 1, latitude: 36.1742, longitude: 8.7049 },
  { id_ville: 5, nom: 'Sfax', id_pays: 1, latitude: 34.7406, longitude: 10.7603 },
  { id_ville: 6, nom: 'Tunis', id_pays: 1, latitude: 36.8065, longitude: 10.1815 },
  { id_ville: 7, nom: 'Zarzis', id_pays: 1, latitude: 33.504, longitude: 11.1122 },

  // France
  { id_ville: 8, nom: 'Lyon', id_pays: 2, latitude: 45.764, longitude: 4.8357 },
  { id_ville: 9, nom: 'Marseille', id_pays: 2, latitude: 43.2965, longitude: 5.3698 },
  { id_ville: 10, nom: 'Nice', id_pays: 2, latitude: 43.7102, longitude: 7.262 },
  { id_ville: 11, nom: 'Paris', id_pays: 2, latitude: 48.8566, longitude: 2.3522 },

  // Maroc
  { id_ville: 12, nom: 'Agadir', id_pays: 3, latitude: 30.4278, longitude: -9.5981 },
  { id_ville: 13, nom: 'Casablanca', id_pays: 3, latitude: 33.5731, longitude: -7.5898 },
  { id_ville: 14, nom: 'Marrakech', id_pays: 3, latitude: 31.6295, longitude: -7.9811 },
  { id_ville: 15, nom: 'Rabat', id_pays: 3, latitude: 34.0209, longitude: -6.8416 },

  // Italie
  { id_ville: 16, nom: 'Florence', id_pays: 4, latitude: 43.7696, longitude: 11.2558 },
  { id_ville: 17, nom: 'Milan', id_pays: 4, latitude: 45.4642, longitude: 9.19 },
  { id_ville: 18, nom: 'Rome', id_pays: 4, latitude: 41.9028, longitude: 12.4964 },

  // Espagne
  { id_ville: 19, nom: 'Barcelone', id_pays: 5, latitude: 41.3874, longitude: 2.1686 },
  { id_ville: 20, nom: 'Madrid', id_pays: 5, latitude: 40.4168, longitude: -3.7038 },
  { id_ville: 21, nom: 'Séville', id_pays: 5, latitude: 37.3891, longitude: -5.9845 },

  // Japon
  { id_ville: 22, nom: 'Kyoto', id_pays: 6, latitude: 35.0116, longitude: 135.7681 },
  { id_ville: 23, nom: 'Osaka', id_pays: 6, latitude: 34.6937, longitude: 135.5023 },
  { id_ville: 24, nom: 'Tokyo', id_pays: 6, latitude: 35.6762, longitude: 139.6503 },
];
