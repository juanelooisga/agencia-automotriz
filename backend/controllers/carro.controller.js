const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

function leerDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function guardarDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function calcularDescuento(cliente) {
  let descuentoAmigo = cliente.esAmigoGerente ? 10 : 0;
  let descuentoCompras = 0;

  if (cliente.comprasRealizadas >= 5) {
    descuentoCompras = 10;
  } else if (cliente.comprasRealizadas >= 3) {
    descuentoCompras = 5;
  }

  return Math.max(descuentoAmigo, descuentoCompras);
}

function calcularPrecioZona(precioBase, sucursal) {
  return Math.round(Number(precioBase) * Number(sucursal.factorPrecio));
}

exports.listar = (req, res) => {
  const db = leerDB();
  res.json(db.carros);
};

exports.obtenerUno = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const item = db.carros.find(c => c.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Carro no encontrado' });
  }

  res.json(item);
};

exports.crear = (req, res) => {
  const db = leerDB();
  const { marca, modelo, anio, color, precioBase, sucursalId } = req.body;

  if (!marca || !modelo || !anio || !color || !precioBase || !sucursalId) {
    return res.status(400).json({ error: 'Todos los campos del carro son obligatorios' });
  }

  const sucursal = db.sucursales.find(s => s.id === Number(sucursalId));
  if (!sucursal) {
    return res.status(400).json({ error: 'La sucursal no existe' });
  }

  const precioZona = calcularPrecioZona(precioBase, sucursal);

  const nuevo = {
    id: db.carros.length ? db.carros[db.carros.length - 1].id + 1 : 1,
    marca,
    modelo,
    anio: Number(anio),
    color,
    precioBase: Number(precioBase),
    precioZona,
    descuentoAplicado: 0,
    precioFinal: precioZona,
    estado: 'disponible',
    sucursalId: Number(sucursalId),
    vendedorId: null,
    clienteId: null
  };

  db.carros.push(nuevo);
  guardarDB(db);

  res.status(201).json(nuevo);
};

exports.actualizar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.carros.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Carro no encontrado' });
  }

  const carroActual = db.carros[index];

  if (carroActual.estado !== 'disponible') {
    return res.status(400).json({ error: 'Solo se pueden editar carros disponibles' });
  }

  let nuevaSucursalId = req.body.sucursalId !== undefined
    ? Number(req.body.sucursalId)
    : carroActual.sucursalId;

  const sucursal = db.sucursales.find(s => s.id === nuevaSucursalId);
  if (!sucursal) {
    return res.status(400).json({ error: 'La sucursal no existe' });
  }

  let nuevoPrecioBase = req.body.precioBase !== undefined
    ? Number(req.body.precioBase)
    : carroActual.precioBase;

  let nuevoPrecioZona = calcularPrecioZona(nuevoPrecioBase, sucursal);

  db.carros[index] = {
    ...carroActual,
    ...req.body,
    anio: req.body.anio !== undefined ? Number(req.body.anio) : carroActual.anio,
    precioBase: nuevoPrecioBase,
    sucursalId: nuevaSucursalId,
    precioZona: nuevoPrecioZona,
    precioFinal: nuevoPrecioZona,
    descuentoAplicado: 0
  };

  guardarDB(db);
  res.json(db.carros[index]);
};

exports.eliminar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.carros.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Carro no encontrado' });
  }

  if (db.carros[index].estado === 'vendido') {
    return res.status(400).json({ error: 'No se puede eliminar un carro vendido' });
  }

  const eliminado = db.carros.splice(index, 1);
  guardarDB(db);
  res.json(eliminado[0]);
};

exports.apartar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const { vendedorId, clienteId } = req.body;

  const carro = db.carros.find(c => c.id === id);
  if (!carro) {
    return res.status(404).json({ error: 'Carro no encontrado' });
  }

  if (carro.estado !== 'disponible') {
    return res.status(400).json({ error: 'El carro no está disponible para apartarse' });
  }

  const vendedor = db.personal.find(p => p.id === Number(vendedorId) && p.rol === 'ventas');
  if (!vendedor) {
    return res.status(400).json({ error: 'El vendedor no existe o no tiene rol de ventas' });
  }

  const cliente = db.clientes.find(c => c.id === Number(clienteId));
  if (!cliente) {
    return res.status(400).json({ error: 'El cliente no existe' });
  }

  carro.estado = 'apartado';
  carro.vendedorId = Number(vendedorId);
  carro.clienteId = Number(clienteId);

  guardarDB(db);
  res.json(carro);
};

exports.vender = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);

  const carro = db.carros.find(c => c.id === id);
  if (!carro) {
    return res.status(404).json({ error: 'Carro no encontrado' });
  }

  if (carro.estado === 'vendido') {
    return res.status(400).json({ error: 'El carro ya fue vendido' });
  }

  if (!carro.vendedorId || !carro.clienteId) {
    return res.status(400).json({ error: 'El carro debe estar apartado con vendedor y cliente antes de venderse' });
  }

  const cliente = db.clientes.find(c => c.id === carro.clienteId);
  const sucursal = db.sucursales.find(s => s.id === carro.sucursalId);

  if (!cliente || !sucursal) {
    return res.status(400).json({ error: 'No se encontró el cliente o la sucursal del carro' });
  }

  const precioZona = calcularPrecioZona(carro.precioBase, sucursal);
  const descuento = calcularDescuento(cliente);
  const precioFinal = Math.round(precioZona - (precioZona * descuento / 100));

  carro.precioZona = precioZona;
  carro.descuentoAplicado = descuento;
  carro.precioFinal = precioFinal;
  carro.estado = 'vendido';

  cliente.comprasRealizadas += 1;
  cliente.montoAcumulado += precioFinal;

  guardarDB(db);

  res.json({
    mensaje: 'Venta realizada correctamente',
    carro,
    clienteActualizado: cliente
  });
};