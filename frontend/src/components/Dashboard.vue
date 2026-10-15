<template>
  <section>
    <div class="dashboard-title">
      <h2>Resumen General</h2>
      <p>Vista rápida del estado actual del sistema</p>
    </div>

    <div class="dashboard-grid">
      <div class="stat-card">
        <span class="stat-label">Sucursales</span>
        <strong class="stat-number">{{ sucursales }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-label">Personal</span>
        <strong class="stat-number">{{ personal }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-label">Clientes</span>
        <strong class="stat-number">{{ clientes }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-label">Carros</span>
        <strong class="stat-number">{{ carros }}</strong>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    sucursales: Number,
    personal: Number,
    clientes: Number,
    carros: Number
  }
}
</script>