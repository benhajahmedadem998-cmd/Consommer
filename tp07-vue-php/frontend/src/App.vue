<!-- src/App.vue — Conteneur principal orchestrant les 3 parties -->
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
