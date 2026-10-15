const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

function leerDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function guardarDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

exports.listar = (req, res) => {
  const db = leerDB();
  res.json(db.clientes);
};

exports.obtenerUno = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const item = db.clientes.find(c => c.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  res.json(item);
};

exports.crear = (req, res) => {
  const db = leerDB();
  const { nombre, telefono, correo, ciudad, esAmigoGerente } = req.body;

  if (!nombre || !telefono || !correo || !ciudad) {
    return res.status(400).json({ error: 'Todos los campos del cliente son obligatorios' });
  }

  const nuevo = {
    id: db.clientes.length ? db.clientes[db.clientes.length - 1].id + 1 : 1,
    nombre,
    telefono,
    correo,
    ciudad,
    esAmigoGerente: Boolean(esAmigoGerente),
    comprasRealizadas: 0,
    montoAcumulado: 0
  };

  db.clientes.push(nuevo);
  guardarDB(db);

  res.status(201).json(nuevo);
};

exports.actualizar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.clientes.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  db.clientes[index] = {
    ...db.clientes[index],
    ...req.body,
    esAmigoGerente: req.body.esAmigoGerente !== undefined
      ? Boolean(req.body.esAmigoGerente)
      : db.clientes[index].esAmigoGerente
  };

  guardarDB(db);
  res.json(db.clientes[index]);
};

exports.eliminar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.clientes.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  const carroRelacionado = db.carros.some(c => c.clienteId === id && c.estado !== 'vendido');
  if (carroRelacionado) {
    return res.status(400).json({ error: 'No se puede eliminar porque tiene carros apartados o activos' });
  }

  const eliminado = db.clientes.splice(index, 1);
  guardarDB(db);
  res.json(eliminado[0]);
};