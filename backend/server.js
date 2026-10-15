const express = require('express');
const sucursalRoutes = require('./routes/sucursal.routes');
const personalRoutes = require('./routes/personal.routes');
const clienteRoutes = require('./routes/cliente.routes');
const carroRoutes = require('./routes/carro.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor CRUD Agencia funcionando con lógica de negocio');
});

app.use('/api/sucursales', sucursalRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/carros', carroRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
  console.log('Base de datos: db.json');
});