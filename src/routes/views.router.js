const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json');

// Ruta home (renderiza todos los productos)
router.get('/', async (req, res) => {
  const productos = await productManager.getProducts();
  res.render('home', { productos });
});

// Ruta realtime (sin productos, los recibe por WebSocket)
router.get('/realtimeproducts', async (req, res) => {
  res.render('realTimeProducts');
});

module.exports = router;
