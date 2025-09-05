import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = Router();

// Crear un carrito nuevo
router.post('/', async (req, res, next) => {
  try {
    const newCart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: newCart });
  } catch (e) {
    next(e);
  }
});

// Obtener un carrito por id
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (e) {
    next(e);
  }
});

// Agregar un producto al carrito con validación de quantity
router.post(
  '/:cid/products/:pid',
  [body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1')],
  validate,
  async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      const cart = await Cart.findById(cid);
      if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

      const product = await Product.findById(pid);
      if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });

      const itemIndex = cart.products.findIndex(p => p.product.toString() === pid);

      if (itemIndex >= 0) {
        // si ya existe, sumo la cantidad
        cart.products[itemIndex].quantity += quantity;
      } else {
        // si no existe, lo agrego
        cart.products.push({ product: pid, quantity });
      }

      await cart.save();
      res.json({ status: 'success', payload: cart });
    } catch (e) {
      next(e);
    }
  }
);

// Actualizar cantidad de un producto en carrito
router.put(
  '/:cid/products/:pid',
  [body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1')],
  validate,
  async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      const cart = await Cart.findById(cid);
      if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

      const item = cart.products.find(p => p.product.toString() === pid);
      if (!item) return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });

      item.quantity = quantity;
      await cart.save();

      res.json({ status: 'success', payload: cart });
    } catch (e) {
      next(e);
    }
  }
);

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.json({ status: 'success', payload: cart });
  } catch (e) {
    next(e);
  }
});

// Vaciar carrito
router.delete('/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = [];
    await cart.save();

    res.json({ status: 'success', message: 'Carrito vaciado' });
  } catch (e) {
    next(e);
  }
});

export default router;
