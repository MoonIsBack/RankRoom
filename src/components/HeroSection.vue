<template>
  <section class="hero-section">
    <div class="hero-content">
      <span class="app-badge">Tierlist Builder</span>

      <h1>
        Erstelle deine
        <span>eigene Tierlist.</span>
      </h1>

      <p>
        Sortiere Plugins, Games, Songs oder alles, was du ranken möchtest — modern, schnell und
        übersichtlich.
      </p>
    </div>

    <div class="hero-card">
      <p class="hero-card-label">Aktuelle Liste</p>
      <strong>{{ tierListName }}</strong>
      <small>{{ totalItems }} Items insgesamt</small>
    </div>
  </section>
</template>

<script setup>
// tierListName = Name der gerade aktiven Tierlist
// totalItems kommt von der übergeordneten App.vue und zeigt an, wie viele
// Items die aktuelle Tierlist insgesamt hat (eingestuft + noch nicht eingestuft)
defineProps({
  tierListName: {
    type: String,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
})
</script>

<style scoped>
.hero-section {
  width: 100%;
  max-width: 1100px;
  margin-bottom: 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hero-content {
  flex: 1;
}

.app-badge {
  display: inline-flex;
  align-items: center;

  margin-bottom: 10px;
  padding: 6px 12px;

  border: 1px solid rgba(167, 139, 250, 0.38);
  border-radius: 999px;

  background: rgba(124, 58, 237, 0.13);
  color: var(--accent);

  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

h1 {
  max-width: 620px;
  margin: 0;

  font-size: clamp(34px, 4.4vw, 50px);
  line-height: 1.02;
  letter-spacing: -2.2px;
}

h1 span {
  display: block;
  padding-bottom: 6px;

  background: linear-gradient(120deg, var(--accent), var(--accent-strong));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

p {
  max-width: 560px;
  margin-top: 8px;

  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.4;
}

.hero-card {
  width: 250px;
  min-height: 130px;
  padding: 16px 18px;

  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;

  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.035)),
    rgba(255, 255, 255, 0.04);

  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-card-label {
  margin: 0 0 5px;

  color: var(--accent);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.hero-card strong {
  font-size: 1rem;
  letter-spacing: -0.04em;
}

.hero-card small {
  margin-top: 6px;

  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

@media (max-width: 850px) {
  .hero-section {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-card {
    width: 100%;
  }
}
</style>
