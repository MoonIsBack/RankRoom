<script setup>
// Zeigt drei kleine Statistik-Kacheln: Gesamtanzahl, eingestufte und
// noch nicht eingestufte Items. Die Zahlen werden von App.vue berechnet
// und hier nur angezeigt.
defineProps({
  totalItems: {
    type: Number,
    required: true,
  },
  rankedItems: {
    type: Number,
    required: true,
  },
  unrankedItems: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <section class="stats-grid">
    <div class="stat-card">
      <span class="stat-label">Items gesamt</span>
      <strong>{{ totalItems }}</strong>
    </div>

    <div class="stat-card">
      <span class="stat-label">Eingestuft</span>
      <strong>{{ rankedItems }}</strong>
    </div>

    <div class="stat-card">
      <span class="stat-label">Nicht eingestuft</span>
      <strong>{{ unrankedItems }}</strong>
    </div>
  </section>
</template>

<style scoped>
.stats-grid {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
}

.stat-label {
  display: block;
  margin-bottom: 8px;
  color: #a8adbd;
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-card strong {
  font-size: 2rem;
  line-height: 1;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Die erste Kachel ("Items gesamt") nimmt die volle Breite ein */
  .stat-card:first-child {
    grid-column: 1 / -1;
  }

  .stat-card strong {
    font-size: 1.6rem;
  }
}
</style>
