import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = Router();

// Crear carrito (helper opcional)
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

// POST /api/carts/:cid/products/:pid (agrega o incrementa)
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

// DELETE /api/carts/:cid/products/:pid  (elimina un producto del carrito)
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

// PUT /api/carts/:cid  (reemplaza todo el arreglo de products)
router.put('/:cid', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) return res.status(400).json({ status: 'error', error: 'products debe ser un array' });

    for (const it of products) {
      if (!it.product) return res.status(400).json({ status: 'error', error: 'Falta product en un item' });
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

// PUT /api/carts/:cid/products/:pid  (actualiza SOLO la cantidad)
router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);

    if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ status: 'error', error: 'quantity inválida' });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });

    item.quantity = qty;
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
