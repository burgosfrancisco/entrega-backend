import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = Router();

// Crear carrito (helper)
router.post('/', async (req, res, next) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// GET /api/carts/:cid  (populate)
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// POST /api/carts/:cid/products/:pid  (agrega o incrementa)
router.post('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const prod = await Product.findById(pid);
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx >= 0) cart.products[idx].quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// DELETE /api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// PUT /api/carts/:cid  (reemplaza todo el arreglo)
router.put('/:cid', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) throw new Error('products debe ser un array');

    for (const it of products) {
      if (!it.product) throw new Error('Falta product en un item');
      if (!it.quantity || it.quantity < 1) it.quantity = 1;
    }

    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $set: { products } },
      { new: true, runValidators: true }
    );
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// PUT /api/carts/:cid/products/:pid  (setea cantidad)
router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const q = parseInt(req.body.quantity);
    if (!Number.isInteger(q) || q < 1) throw new Error('Cantidad inválida');

    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const idx = cart.products.findIndex(p => p.product.toString() === req.params.pid);
    if (idx < 0) return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });

    cart.products[idx].quantity = q;
    await cart.save();

    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// DELETE /api/carts/:cid  (vacía carrito)
router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { $set: { products: [] } },
      { new: true }
    );
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

export default router;
