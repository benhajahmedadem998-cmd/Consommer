<!-- src/components/Partie2PaysVilles.vue — Pays et villes avec Fetch -->
<script setup>
import { ref, watch, onMounted } from 'vue';
import SelecteurListe from './SelecteurListe.vue';

const API_BASE = 'http://localhost/tp07/backend/partie2';

const listePays = ref([]);
const listeVilles = ref([]);
const idPaysSelectionne = ref('');
const idVilleSelectionnee = ref('');
const erreur = ref('');

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/get_pays.php`);
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
      `${API_BASE}/get_villes.php?id_pays=${encodeURIComponent(nouvelIdPays)}`
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
