<!-- src/components/SelecteurListe.vue — Composant réutilisable (defineModel + props) -->
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
