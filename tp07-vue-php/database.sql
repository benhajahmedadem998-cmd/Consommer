-- database.sql — Base de données MySQL pour le TP 07
CREATE DATABASE IF NOT EXISTS tp07_geographie
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tp07_geographie;

CREATE TABLE IF NOT EXISTS pays (
  id_pays INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

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

INSERT INTO pays (id_pays, nom) VALUES
  (1, 'Tunisie'),
  (2, 'France'),
  (3, 'Maroc'),
  (4, 'Italie');

INSERT INTO ville (nom, id_pays, latitude, longitude) VALUES
  ('Djerba', 1, 33.875000, 10.857500),
  ('Douz',   1, 33.466300,  9.020300),
  ('Gabès',  1, 33.881500, 10.098200),
  ('Kef',    1, 36.174200,  8.704900),
  ('Sfax',   1, 34.740600, 10.760300),
  ('Tunis',  1, 36.806500, 10.181500),
  ('Zarzis', 1, 33.504000, 11.112200),
  ('Lyon',      2, 45.764000, 4.835700),
  ('Marseille', 2, 43.296500, 5.369800),
  ('Paris',     2, 48.856600, 2.352200),
  ('Agadir',     3, 30.427800, -9.598100),
  ('Casablanca', 3, 33.573100, -7.589800),
  ('Marrakech',  3, 31.629500, -7.981100),
  ('Milan', 4, 45.464200,  9.190000),
  ('Rome',  4, 41.902800, 12.496400);
