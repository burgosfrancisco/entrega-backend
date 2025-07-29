const { Router } = require('express');

const ProductManager = require('../managers/ProductManager');


const router = Router();
const manager = new ProductManager('./src/data/products.json');

router.post('/', async (req, res) => {
  const { title, description, code, price, status = true, stock, category, thumbnails } = req.body;

  if (!title || !description || !code || !price || stock == null || !category || !Array.isArray(thumbnails)) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const nuevo = await manager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const actualizado = await manager.updateProduct(req.params.pid, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const ok = await manager.deleteProduct(req.params.pid);
    if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;

