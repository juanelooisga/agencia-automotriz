const express = require('express');
const path = require('path');
const sucursalRoutes = require('./routes/sucursal.routes');
const personalRoutes = require('./routes/personal.routes');
const clienteRoutes = require('./routes/cliente.routes');
const carroRoutes = require('./routes/carro.routes');

const app = express();

app.use(express.json());

app.use('/api/sucursales', sucursalRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/carros', carroRoutes);

// Sirve la interfaz compilada desde el mismo origen que la API.
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// Conserva el mensaje del backend cuando se utiliza sin compilar el frontend.
app.get('/', (req, res) => {
  res.send('Servidor CRUD Agencia funcionando con lógica de negocio');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
  console.log('Base de datos: db.json');
});
