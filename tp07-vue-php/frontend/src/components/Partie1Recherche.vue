<!-- src/components/Partie1Recherche.vue — API Fetch + validation -->
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

  if (valeur === '') {
    erreur.value = 'Veuillez saisir un identifiant de pays.';
    return;
  }

  if (!/^\d+$/.test(valeur)) {
    erreur.value = "L'identifiant doit être un nombre entier.";
    return;
  }

  chargement.value = true;
  try {
    const reponse = await fetch(
      `${API_BASE}/rechercher_pays.php?id_pays=${encodeURIComponent(valeur)}`
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
