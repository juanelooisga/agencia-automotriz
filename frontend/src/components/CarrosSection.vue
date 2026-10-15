<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <h2>Productos / Carros</h2>
        <p>Administra los carros como productos principales de la agencia incluyendo precio sucursal apartado y venta.</p>
      </div>
    </div>

    <div v-if="mensaje" class="alert success">{{ mensaje }}</div>

    <form @submit.prevent="guardarCarro" class="form-grid">
      <div class="field">
        <input v-model.trim="form.marca" placeholder="Marca" />
        <small class="error" v-if="errores.marca">{{ errores.marca }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.modelo" placeholder="Modelo" />
        <small class="error" v-if="errores.modelo">{{ errores.modelo }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.anio" placeholder="Anio" />
        <small class="error" v-if="errores.anio">{{ errores.anio }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.color" placeholder="Color" />
        <small class="error" v-if="errores.color">{{ errores.color }}</small>
      </div>

      <div class="field">
        <input v-model.trim="form.precioBase" placeholder="Precio base" />
        <small class="error" v-if="errores.precioBase">{{ errores.precioBase }}</small>
      </div>

      <div class="field">
        <select v-model="form.sucursalId">
          <option value="">Selecciona sucursal</option>
          <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }}</option>
        </select>
        <small class="error" v-if="errores.sucursalId">{{ errores.sucursalId }}</small>
      </div>

      <div class="form-actions">
        <button type="submit">{{ editando ? 'Actualizar' : 'Guardar producto' }}</button>
        <button type="button" class="secondary" @click="limpiarFormulario">Limpiar</button>
      </div>
    </form>

    <div class="list-container">
      <article v-for="carro in carros" :key="carro.id" class="item-card">
        <h3>{{ carro.marca }} {{ carro.modelo }}</h3>
        <p><strong>Estado:</strong> {{ carro.estado }}</p>
        <p><strong>Sucursal:</strong> {{ obtenerSucursal(carro.sucursalId) }}</p>
        <p><strong>Precio base:</strong> ${{ carro.precioBase }}</p>
        <p><strong>Precio zona:</strong> ${{ carro.precioZona }}</p>
        <p><strong>Descuento:</strong> {{ carro.descuentoAplicado }}%</p>
        <p><strong>Precio final:</strong> ${{ carro.precioFinal }}</p>
        <p><strong>Vendedor:</strong> {{ obtenerVendedor(carro.vendedorId) }}</p>
        <p><strong>Cliente:</strong> {{ obtenerCliente(carro.clienteId) }}</p>

        <div class="item-actions">
          <button @click="editarCarro(carro)" :disabled="carro.estado !== 'disponible'">Editar</button>
          <button class="danger" @click="eliminarCarro(carro.id)" :disabled="carro.estado === 'vendido'">Eliminar</button>
        </div>

        <div class="business-box" v-if="carro.estado === 'disponible'">
          <h4>Apartar carro</h4>

          <select v-model="apartarData[carro.id].vendedorId">
            <option value="">Selecciona vendedor</option>
            <option v-for="v in vendedores" :key="v.id" :value="v.id">{{ v.nombre }}</option>
          </select>

          <select v-model="apartarData[carro.id].clienteId">
            <option value="">Selecciona cliente</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>

          <button @click="apartarCarro(carro.id)">Apartar</button>
        </div>

        <div class="business-box" v-if="carro.estado === 'apartado'">
          <h4>Proceso de venta</h4>
          <button @click="venderCarro(carro.id)">Vender carro</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    carros: Array,
    sucursales: Array,
    personal: Array,
    clientes: Array
  },
  data() {
    return {
      editando: false,
      idActual: null,
      mensaje: '',
      form: {
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        precioBase: '',
        sucursalId: ''
      },
      errores: {},
      apartarData: {}
    }
  },
  computed: {
    vendedores() {
      return this.personal.filter(p => p.rol === 'ventas')
    }
  },
  watch: {
    carros: {
      immediate: true,
      handler(nuevos) {
        const base = {}
        nuevos.forEach(c => {
          base[c.id] = {
            vendedorId: '',
            clienteId: ''
          }
        })
        this.apartarData = base
      }
    }
  },
  methods: {
    obtenerSucursal(id) {
      const s = this.sucursales.find(x => x.id === id)
      return s ? s.nombre : 'Sin sucursal'
    },
    obtenerVendedor(id) {
      const v = this.personal.find(x => x.id === id)
      return v ? v.nombre : 'Sin vendedor'
    },
    obtenerCliente(id) {
      const c = this.clientes.find(x => x.id === id)
      return c ? c.nombre : 'Sin cliente'
    },
    limpiarErrores() {
      this.errores = {}
    },
    validarCarro() {
      this.limpiarErrores()
      let ok = true

      if (!this.form.marca) {
        this.errores.marca = 'Marca obligatoria'
        ok = false
      }

      if (!this.form.modelo) {
        this.errores.modelo = 'Modelo obligatorio'
        ok = false
      }

      if (!/^\d{4}$/.test(this.form.anio)) {
        this.errores.anio = 'Anio de 4 digitos'
        ok = false
      }

      if (!this.form.color) {
        this.errores.color = 'Color obligatorio'
        ok = false
      }

      if (!/^\d+$/.test(this.form.precioBase)) {
        this.errores.precioBase = 'Solo numeros'
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
      setTimeout(() => this.mensaje = '', 3000)
    },
    async guardarCarro() {
      if (!this.validarCarro()) return

      const url = this.editando ? `/api/carros/${this.idActual}` : '/api/carros'
      const method = this.editando ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...this.form,
          anio: Number(this.form.anio),
          precioBase: Number(this.form.precioBase),
          sucursalId: Number(this.form.sucursalId)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al guardar producto')
        return
      }

      this.mostrarMensaje(this.editando ? 'Producto actualizado correctamente' : 'Producto guardado correctamente')
      this.limpiarFormulario()
      this.$emit('refrescar')
    },
    editarCarro(carro) {
      this.editando = true
      this.idActual = carro.id
      this.form = {
        marca: carro.marca,
        modelo: carro.modelo,
        anio: carro.anio,
        color: carro.color,
        precioBase: carro.precioBase,
        sucursalId: carro.sucursalId
      }
    },
    async eliminarCarro(id) {
      if (!confirm('Deseas eliminar este producto')) return

      const res = await fetch(`/api/carros/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al eliminar producto')
        return
      }

      this.mostrarMensaje('Producto eliminado correctamente')
      this.$emit('refrescar')
    },
    async apartarCarro(id) {
      const payload = this.apartarData[id]

      if (!payload.vendedorId || !payload.clienteId) {
        alert('Selecciona vendedor y cliente')
        return
      }

      const res = await fetch(`/api/carros/${id}/apartar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedorId: Number(payload.vendedorId),
          clienteId: Number(payload.clienteId)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al apartar producto')
        return
      }

      this.mostrarMensaje('Producto apartado correctamente')
      this.$emit('refrescar')
    },
    async venderCarro(id) {
      const res = await fetch(`/api/carros/${id}/vender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al vender producto')
        return
      }

      this.mostrarMensaje('Venta realizada correctamente con descuento calculado')
      this.$emit('refrescar')
    },
    limpiarFormulario() {
      this.editando = false
      this.idActual = null
      this.form = {
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        precioBase: '',
        sucursalId: ''
      }
      this.limpiarErrores()
    }
  }
}
</script>