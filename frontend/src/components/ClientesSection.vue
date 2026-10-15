<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <h2>Clientes</h2>
        <p>Gestiona clientes, historial y descuentos especiales.</p>
      </div>
    </div>

    <div v-if="mensaje" class="alert success">{{ mensaje }}</div>

    <form @submit.prevent="guardar" class="form-grid">
      <div class="field">
        <input v-model.trim="form.nombre" placeholder="Nombre completo" />
        <small class="error" v-if="errores.nombre">{{ errores.nombre }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.telefono" placeholder="Teléfono" />
        <small class="error" v-if="errores.telefono">{{ errores.telefono }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.correo" placeholder="Correo" />
        <small class="error" v-if="errores.correo">{{ errores.correo }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.ciudad" placeholder="Ciudad" />
        <small class="error" v-if="errores.ciudad">{{ errores.ciudad }}</small>
      </div>

      <div class="field checkbox-field">
        <label>
          <input type="checkbox" v-model="form.esAmigoGerente" />
          ¿Es amigo del gerente?
        </label>
      </div>

      <div class="form-actions">
        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" class="secondary" @click="limpiar">Limpiar</button>
      </div>
    </form>

    <div class="list-container">
      <article v-for="c in clientes" :key="c.id" class="item-card">
        <h3>{{ c.nombre }}</h3>
        <p><strong>Ciudad:</strong> {{ c.ciudad }}</p>
        <p><strong>Correo:</strong> {{ c.correo }}</p>
        <p><strong>Compras:</strong> {{ c.comprasRealizadas }}</p>
        <p><strong>Monto acumulado:</strong> ${{ c.montoAcumulado }}</p>
        <p><strong>Amigo del gerente:</strong> {{ c.esAmigoGerente ? 'Sí' : 'No' }}</p>

        <div class="item-actions">
          <button @click="editar(c)">Editar</button>
          <button class="danger" @click="eliminar(c.id)">Eliminar</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    clientes: Array
  },
  data() {
    return {
      editando: false,
      idActual: null,
      mensaje: '',
      form: {
        nombre: '',
        telefono: '',
        correo: '',
        ciudad: '',
        esAmigoGerente: false
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
      if (!/^\d+$/.test(this.form.telefono)) { this.errores.telefono = 'Solo números'; ok = false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.correo)) { this.errores.correo = 'Correo inválido'; ok = false }
      if (!this.form.ciudad) { this.errores.ciudad = 'Ciudad obligatoria'; ok = false }

      return ok
    },
    mostrarMensaje(texto) {
      this.mensaje = texto
      setTimeout(() => this.mensaje = '', 2500)
    },
    async guardar() {
      if (!this.validar()) return

      const url = this.editando ? `/api/clientes/${this.idActual}` : '/api/clientes'
      const method = this.editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form)
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al guardar cliente')
        return
      }

      this.mostrarMensaje(this.editando ? 'Cliente actualizado correctamente' : 'Cliente guardado correctamente')
      this.limpiar()
      this.$emit('refrescar')
    },
    editar(item) {
      this.editando = true
      this.idActual = item.id
      this.form = { ...item }
    },
    async eliminar(id) {
      if (!confirm('¿Eliminar cliente?')) return

      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al eliminar')
        return
      }

      this.mostrarMensaje('Cliente eliminado correctamente')
      this.$emit('refrescar')
    },
    limpiar() {
      this.editando = false
      this.idActual = null
      this.form = {
        nombre: '',
        telefono: '',
        correo: '',
        ciudad: '',
        esAmigoGerente: false
      }
      this.limpiarErrores()
    }
  }
}
</script>