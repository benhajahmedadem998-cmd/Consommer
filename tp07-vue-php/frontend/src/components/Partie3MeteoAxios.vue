<!-- src/components/Partie3MeteoAxios.vue — Duplication avec Axios + Open-Meteo -->
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
    const { data } = await axios.get(`${API_BASE}/get_pays.php`);
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
    const { data } = await axios.get(`${API_BASE}/get_villes.php`, {
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
    const { data } = await axios.get(`${API_BASE}/get_meteo.php`, {
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
