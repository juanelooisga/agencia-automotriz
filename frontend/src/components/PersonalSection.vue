<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <h2>Usuarios / Personal</h2>
        <p>Administra los usuarios internos del sistema sus roles y la sucursal asignada.</p>
      </div>
    </div>

    <div v-if="mensaje" class="alert success">{{ mensaje }}</div>

    <form @submit.prevent="guardar" class="form-grid">
      <div class="field">
        <input v-model.trim="form.nombre" placeholder="Nombre completo" />
        <small class="error" v-if="errores.nombre">{{ errores.nombre }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.puesto" placeholder="Puesto" />
        <small class="error" v-if="errores.puesto">{{ errores.puesto }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.telefono" placeholder="Telefono" />
        <small class="error" v-if="errores.telefono">{{ errores.telefono }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.correo" placeholder="Correo" />
        <small class="error" v-if="errores.correo">{{ errores.correo }}</small>
      </div>

      <div class="field">
        <select v-model="form.rol">
          <option value="">Selecciona rol</option>
          <option value="gerente">Gerente</option>
          <option value="ventas">Ventas</option>
          <option value="administrativo">Administrativo</option>
        </select>
        <small class="error" v-if="errores.rol">{{ errores.rol }}</small>
      </div>

      <div class="field">
        <select v-model="form.sucursalId">
          <option value="">Selecciona sucursal</option>
          <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
        </select>
        <small class="error" v-if="errores.sucursalId">{{ errores.sucursalId }}</small>
      </div>

      <div class="form-actions">
        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" class="secondary" @click="limpiar">Limpiar</button>
      </div>
    </form>

    <div class="list-container">
      <article v-for="p in personal" :key="p.id" class="item-card">
        <h3>{{ p.nombre }}</h3>
        <p><strong>Puesto:</strong> {{ p.puesto }}</p>
        <p><strong>Rol:</strong> {{ p.rol }}</p>
        <p><strong>Telefono:</strong> {{ p.telefono }}</p>
        <p><strong>Correo:</strong> {{ p.correo }}</p>
        <p><strong>Sucursal:</strong> {{ obtenerSucursal(p.sucursalId) }}</p>

        <div class="item-actions">
          <button @click="editar(p)">Editar</button>
          <button class="danger" @click="eliminar(p.id)">Eliminar</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    personal: Array,
    sucursales: Array
  },
  data() {
    return {
      editando: false,
      idActual: null,
      mensaje: '',
      form: {
        nombre: '',
        puesto: '',
        telefono: '',
        correo: '',
        rol: '',
        sucursalId: ''
      },
      errores: {}
    }
  },
  methods: {
    obtenerSucursal(id) {
      const s = this.sucursales.find(x => x.id === id)
      return s ? s.nombre : 'Sin asignar'
    },
    limpiarErrores() {
      this.errores = {}
    },
    validar() {
      this.limpiarErrores()
      let ok = true

      if (!this.form.nombre) {
        this.errores.nombre = 'Nombre obligatorio'
        ok = false
      }

      if (!this.form.puesto) {
        this.errores.puesto = 'Puesto obligatorio'
        ok = false
      }

      if (!/^\d+$/.test(this.form.telefono)) {
        this.errores.telefono = 'Solo numeros'
        ok = false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.correo)) {
        this.errores.correo = 'Correo invalido'
        ok = false
      }

      if (!this.form.rol) {
        this.errores.rol = 'Selecciona rol'
        ok = false
      }

      if (!this.form.sucursalId) {
        this.errores.sucursalId = 'Selecciona sucursal'
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

      const url = this.editando ? `/api/personal/${this.idActual}` : '/api/personal'
      const method = this.editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.form,
          sucursalId: Number(this.form.sucursalId)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al guardar usuario')
        return
      }

      this.mostrarMensaje(this.editando ? 'Usuario actualizado correctamente' : 'Usuario guardado correctamente')
      this.limpiar()
      this.$emit('refrescar')
    },
    editar(item) {
      this.editando = true
      this.idActual = item.id
      this.form = { ...item }
    },
    async eliminar(id) {
      if (!confirm('Deseas eliminar este usuario')) return

      const res = await fetch(`/api/personal/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al eliminar')
        return
      }

      this.mostrarMensaje('Usuario eliminado correctamente')
      this.$emit('refrescar')
    },
    limpiar() {
      this.editando = false
      this.idActual = null
      this.form = {
        nombre: '',
        puesto: '',
        telefono: '',
        correo: '',
        rol: '',
        sucursalId: ''
      }
      this.limpiarErrores()
    }
  }
}
</script>