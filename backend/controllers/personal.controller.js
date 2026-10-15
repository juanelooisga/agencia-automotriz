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
  res.json(db.personal);
};

exports.obtenerUno = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const item = db.personal.find(p => p.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Personal no encontrado' });
  }

  res.json(item);
};

exports.crear = (req, res) => {
  const db = leerDB();
  const { nombre, puesto, telefono, correo, rol, sucursalId } = req.body;

  if (!nombre || !puesto || !telefono || !correo || !rol || !sucursalId) {
    return res.status(400).json({ error: 'Todos los campos de personal son obligatorios' });
  }

  const sucursalExiste = db.sucursales.some(s => s.id === Number(sucursalId));
  if (!sucursalExiste) {
    return res.status(400).json({ error: 'La sucursal asignada no existe' });
  }

  const nuevo = {
    id: db.personal.length ? db.personal[db.personal.length - 1].id + 1 : 1,
    nombre,
    puesto,
    telefono,
    correo,
    rol,
    sucursalId: Number(sucursalId)
  };

  db.personal.push(nuevo);
  guardarDB(db);

  res.status(201).json(nuevo);
};

exports.actualizar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.personal.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Personal no encontrado' });
  }

  if (req.body.sucursalId) {
    const sucursalExiste = db.sucursales.some(s => s.id === Number(req.body.sucursalId));
    if (!sucursalExiste) {
      return res.status(400).json({ error: 'La sucursal asignada no existe' });
    }
  }

  db.personal[index] = {
    ...db.personal[index],
    ...req.body,
    sucursalId: req.body.sucursalId !== undefined
      ? Number(req.body.sucursalId)
      : db.personal[index].sucursalId
  };

  guardarDB(db);
  res.json(db.personal[index]);
};

exports.eliminar = (req, res) => {
  const db = leerDB();
  const id = Number(req.params.id);
  const index = db.personal.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Personal no encontrado' });
  }

  const vendedorRelacionado = db.carros.some(c => c.vendedorId === id && c.estado !== 'vendido');
  if (vendedorRelacionado) {
    return res.status(400).json({ error: 'No se puede eliminar porque tiene carros activos asignados' });
  }

  const eliminado = db.personal.splice(index, 1);
  guardarDB(db);
  res.json(eliminado[0]);
};