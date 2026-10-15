<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <h2>Sucursales</h2>
        <p>Configura ubicación, zona y factor de precio por sucursal.</p>
      </div>
    </div>

    <div v-if="mensaje" class="alert success">{{ mensaje }}</div>

    <form @submit.prevent="guardar" class="form-grid">
      <div class="field">
        <input v-model.trim="form.nombre" placeholder="Nombre de sucursal" />
        <small class="error" v-if="errores.nombre">{{ errores.nombre }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.direccion" placeholder="Dirección" />
        <small class="error" v-if="errores.direccion">{{ errores.direccion }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.telefono" placeholder="Teléfono" />
        <small class="error" v-if="errores.telefono">{{ errores.telefono }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.ciudad" placeholder="Ciudad" />
        <small class="error" v-if="errores.ciudad">{{ errores.ciudad }}</small>
      </div>

      <div class="field">
        <select v-model="form.zona">
          <option value="">Selecciona una zona</option>
          <option value="premium">Premium</option>
          <option value="media">Media</option>
          <option value="normal">Normal</option>
        </select>
        <small class="error" v-if="errores.zona">{{ errores.zona }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.factorPrecio" placeholder="Factor de precio. Ejemplo: 1.12" />
        <small class="error" v-if="errores.factorPrecio">{{ errores.factorPrecio }}</small>
      </div>

      <div class="form-actions">
        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" class="secondary" @click="limpiar">Limpiar</button>
      </div>
    </form>

    <div class="list-container">
      <article v-for="s in sucursales" :key="s.id" class="item-card">
        <h3>{{ s.nombre }}</h3>
        <p><strong>Ciudad:</strong> {{ s.ciudad }}</p>
        <p><strong>Zona:</strong> {{ s.zona }}</p>
        <p><strong>Factor:</strong> {{ s.factorPrecio }}</p>
        <p><strong>Teléfono:</strong> {{ s.telefono }}</p>

        <div class="item-actions">
          <button @click="editar(s)">Editar</button>
          <button class="danger" @click="eliminar(s.id)">Eliminar</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    sucursales: Array
  },
  data() {
    return {
      editando: false,
      idActual: null,
      mensaje: '',
      form: {
        nombre: '',
        direccion: '',
        telefono: '',
        ciudad: '',
        zona: '',
        factorPrecio: ''
      },
      errores: {}
    }
  },
  methods: {
    limpiarErrores() {
      this.errores = {}
    },
    validar() {
      this.limpiarErrores()
      let ok = true

      if (!this.form.nombre) { this.errores.nombre = 'Nombre obligatorio'; ok = false }
      if (!this.form.direccion) { this.errores.direccion = 'Dirección obligatoria'; ok = false }
      if (!/^\d+$/.test(this.form.telefono)) { this.errores.telefono = 'Solo números'; ok = false }
      if (!this.form.ciudad) { this.errores.ciudad = 'Ciudad obligatoria'; ok = false }
      if (!this.form.zona) { this.errores.zona = 'Selecciona una zona'; ok = false }
      if (isNaN(Number(this.form.factorPrecio)) || Number(this.form.factorPrecio) <= 0) {
        this.errores.factorPrecio = 'Factor válido mayor a 0'
        ok = false
      }

      return ok
    },
    mostrarMensaje(texto) {
      this.mensaje = texto
      setTimeout(() => this.mensaje = '', 2500)
    },
    async guardar() {
      if (!this.validar()) return

      const url = this.editando ? `/api/sucursales/${this.idActual}` : '/api/sucursales'
      const method = this.editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.form,
          factorPrecio: Number(this.form.factorPrecio)
        })
      })

      if (!res.ok) {
        const e = await res.json()
        alert(e.error || 'Error al guardar')
        return
      }

      this.mostrarMensaje(this.editando ? 'Sucursal actualizada correctamente' : 'Sucursal guardada correctamente')
      this.limpiar()
      this.$emit('refrescar')
    },
    editar(item) {
      this.editando = true
      this.idActual = item.id
      this.form = { ...item }
    },
    async eliminar(id) {
      if (!confirm('¿Eliminar sucursal?')) return

      const res = await fetch(`/api/sucursales/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al eliminar')
        return
      }

      this.mostrarMensaje('Sucursal eliminada correctamente')
      this.$emit('refrescar')
    },
    limpiar() {
      this.editando = false
      this.idActual = null
      this.form = {
        nombre: '',
        direccion: '',
        telefono: '',
        ciudad: '',
        zona: '',
        factorPrecio: ''
      }
      this.limpiarErrores()
    }
  }
}
</script>