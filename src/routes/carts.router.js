const { Router } = require('express');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const CartManager = require('../managers/CartManager');
const manager = new CartManager('./src/data/carts.json');


router.post('/', async (req, res) => {
  try {
    const nuevo = await manager.createCart();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});


router.get('/:cid', async (req, res) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});


router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const carrito = await manager.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
    if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

module.exports = router;

