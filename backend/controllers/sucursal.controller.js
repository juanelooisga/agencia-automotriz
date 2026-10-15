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
  res.json(db.sucursales);
};

exports.obtenerUna = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const item = db.sucursales.find(s => s.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Sucursal no encontrada' });
  }

  res.json(item);
};

exports.crear = (req, res) => {
  const db = leerDB();
  const { nombre, direccion, telefono, ciudad, zona, factorPrecio } = req.body;

  if (!nombre || !direccion || !telefono || !ciudad || !zona || factorPrecio === undefined) {
    return res.status(400).json({ error: 'Todos los campos de sucursal son obligatorios' });
  }

  const nueva = {
    id: db.sucursales.length ? db.sucursales[db.sucursales.length - 1].id + 1 : 1,
    nombre,
    direccion,
    telefono,
    ciudad,
    zona,
    factorPrecio: Number(factorPrecio)
  };

  db.sucursales.push(nueva);
  guardarDB(db);

  res.status(201).json(nueva);
};

exports.actualizar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.sucursales.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Sucursal no encontrada' });
  }

  db.sucursales[index] = {
    ...db.sucursales[index],
    ...req.body,
    factorPrecio: req.body.factorPrecio !== undefined
      ? Number(req.body.factorPrecio)
      : db.sucursales[index].factorPrecio
  };

  guardarDB(db);
  res.json(db.sucursales[index]);
};

exports.eliminar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.sucursales.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Sucursal no encontrada' });
  }

  const relacionadaPersonal = db.personal.some(p => p.sucursalId === id);
  const relacionadaCarros = db.carros.some(c => c.sucursalId === id);

  if (relacionadaPersonal || relacionadaCarros) {
    return res.status(400).json({
      error: 'No se puede eliminar la sucursal porque tiene personal o carros asignados'
    });
  }

  const eliminada = db.sucursales.splice(index, 1);
  guardarDB(db);
  res.json(eliminada[0]);
};