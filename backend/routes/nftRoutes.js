const express = require('express');
const { getCustomizationOptions, generateAndSaveNftImage } = require('../controllers/nftController');

const router = express.Router();

// Ruta para obtener las opciones de personalización disponibles para un NFT específico
router.get('/:nftId/customize-options', getCustomizationOptions);

// Ruta para generar y guardar la nueva imagen del NFT con las variantes seleccionadas
router.post('/customize', generateAndSaveNftImage);

module.exports = router;