const express = require('express');
const router = express.Router();
const controller = require('../controllers/carro.controller');

router.get('/', controller.listar);
router.get('/:id', controller.obtenerUno);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

router.post('/:id/apartar', controller.apartar);
router.post('/:id/vender', controller.vender);

module.exports = router;