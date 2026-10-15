<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <h2>Agencia AutoPro</h2>
        <p>Panel administrativo</p>
      </div>

      <nav class="menu">
        <button :class="['menu-btn', { active: tabActiva === 'dashboard' }]" @click="tabActiva = 'dashboard'">
          Dashboard
        </button>

        <button :class="['menu-btn', { active: tabActiva === 'sucursales' }]" @click="tabActiva = 'sucursales'">
          Sucursales
        </button>

        <button :class="['menu-btn', { active: tabActiva === 'personal' }]" @click="tabActiva = 'personal'">
          Usuarios / Personal
        </button>

        <button :class="['menu-btn', { active: tabActiva === 'clientes' }]" @click="tabActiva = 'clientes'">
          Clientes
        </button>

        <button :class="['menu-btn', { active: tabActiva === 'carros' }]" @click="tabActiva = 'carros'">
          Productos / Carros
        </button>
      </nav>
    </aside>

    <main class="main-panel">
      <header class="topbar">
        <div>
          <h1>Sistema Web Administrativo para una Agencia de Carros</h1>
          <p>Gestion de sucursales usuarios clientes y productos con logica de negocio</p>
        </div>
      </header>

      <section v-if="tabActiva === 'dashboard'">
        <Dashboard
          :sucursales="sucursales.length"
          :personal="personal.length"
          :clientes="clientes.length"
          :carros="carros.length"
        />
      </section>

      <section v-if="tabActiva === 'sucursales'">
        <SucursalesSection
          :sucursales="sucursales"
          @refrescar="cargarTodo"
        />
      </section>

      <section v-if="tabActiva === 'personal'">
        <PersonalSection
          :personal="personal"
          :sucursales="sucursales"
          @refrescar="cargarTodo"
        />
      </section>

      <section v-if="tabActiva === 'clientes'">
        <ClientesSection
          :clientes="clientes"
          @refrescar="cargarTodo"
        />
      </section>

      <section v-if="tabActiva === 'carros'">
        <CarrosSection
          :carros="carros"
          :sucursales="sucursales"
          :personal="personal"
          :clientes="clientes"
          @refrescar="cargarTodo"
        />
      </section>
    </main>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'
import SucursalesSection from './components/SucursalesSection.vue'
import PersonalSection from './components/PersonalSection.vue'
import ClientesSection from './components/ClientesSection.vue'
import CarrosSection from './components/CarrosSection.vue'

export default {
  components: {
    Dashboard,
    SucursalesSection,
    PersonalSection,
    ClientesSection,
    CarrosSection
  },
  data() {
    return {
      tabActiva: 'dashboard',
      sucursales: [],
      personal: [],
      clientes: [],
      carros: []
    }
  },
  mounted() {
    this.cargarTodo()
  },
  methods: {
    async cargarTodo() {
      try {
        const [resSuc, resPer, resCli, resCar] = await Promise.all([
          fetch('/api/sucursales'),
          fetch('/api/personal'),
          fetch('/api/clientes'),
          fetch('/api/carros')
        ])

        this.sucursales = await resSuc.json()
        this.personal = await resPer.json()
        this.clientes = await resCli.json()
        this.carros = await resCar.json()
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }
  }
}
</script>