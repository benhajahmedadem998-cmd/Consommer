<!-- src/components/BarreNavigation.vue -->
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
