<!-- src/components/CarteMeteo.vue — Composant de présentation pur -->
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
