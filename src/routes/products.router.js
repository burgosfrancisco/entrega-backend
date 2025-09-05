import { Router } from 'express';
import Product from '../models/Product.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';

const router = Router();

// GET /api/products?limit=&page=&sort=&query=
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const lim = Math.max(parseInt(limit) || 10, 1);
    const pg  = Math.max(parseInt(page)  || 1, 1);

    // query: "category:Remeras" | "status:true/false"
    const filter = {};
    if (query) {
      const [k, v] = String(query).split(':');
      if (k === 'category' && v) filter.category = v;
      if (k === 'status' && ['true', 'false'].includes(v)) filter.status = (v === 'true');
    }

    let sortOpt;
    if (sort === 'asc')  sortOpt = { price: 1 };
    if (sort === 'desc') sortOpt = { price: -1 };

    const total = await Product.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);
    const pageSafe = Math.min(pg, totalPages);
    const products = await Product.find(filter)
      .sort(sortOpt)
      .skip((pageSafe - 1) * lim)
      .limit(lim)
      .lean();

    const hasPrev = pageSafe > 1;
    const hasNext = pageSafe < totalPages;

    const buildLink = (p) => {
      const s = new URLSearchParams();
      s.set('page', p);
      s.set('limit', lim);
      if (sort)  s.set('sort', sort);
      if (query) s.set('query', query);
      return `/api/products?${s.toString()}`;
    };

    return res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: hasPrev ? pageSafe - 1 : null,
      nextPage: hasNext ? pageSafe + 1 : null,
      page: pageSafe,
      hasPrevPage: hasPrev,
      hasNextPage: hasNext,
      prevLink: hasPrev ? buildLink(pageSafe - 1) : null,
      nextLink: hasNext ? buildLink(pageSafe + 1) : null
    });
  } catch (e) { next(e); }
});

// Crear producto con validaciones
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('price').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const prod = await Product.create(req.body);
      res.status(201).json({ status: 'success', payload: prod });
    } catch (e) { next(e); }
  }
);

// Actualizar producto con validaciones
router.put(
  '/:pid',
  [
    body('price').optional().isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const prod = await Product.findByIdAndUpdate(
        req.params.pid,
        req.body,
        { new: true, runValidators: true }
      );
      if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
      res.json({ status: 'success', payload: prod });
    } catch (e) { next(e); }
  }
);

// Borrar producto
router.delete('/:pid', async (req, res, next) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.pid);
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (e) { next(e); }
});

export default router;
