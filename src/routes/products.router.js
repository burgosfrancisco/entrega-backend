import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// GET /api/products?limit=&page=&sort=&query=
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const lim = Math.max(parseInt(limit) || 10, 1);
    const pg  = Math.max(parseInt(page)  || 1, 1);

    // query: "category:Remeras" | "status:true/false"
    let filter = {};
    if (query) {
      const [key, raw] = String(query).split(':');
      if (key === 'category' && raw) filter.category = raw;
      if (key === 'status' && ['true','false'].includes(raw)) filter.status = (raw === 'true');
    }

    let sortOpt;
    if (sort === 'asc') sortOpt = { price: 1 };
    if (sort === 'desc') sortOpt = { price: -1 };

    const totalDocs = await Product.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalDocs / lim), 1);
    const currentPage = Math.min(pg, totalPages);

    const payload = await Product.find(filter)
      .sort(sortOpt)
      .skip((currentPage - 1) * lim)
      .limit(lim)
      .lean();

    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;
    const link = (p) => {
      const s = new URLSearchParams();
      s.set('page', p); s.set('limit', lim);
      if (sort)  s.set('sort', sort);
      if (query) s.set('query', query);
      return `/api/products?${s.toString()}`;
    };

    res.json({
      status: 'success',
      payload,
      totalPages,
      prevPage: hasPrevPage ? currentPage - 1 : null,
      nextPage: hasNextPage ? currentPage + 1 : null,
      page: currentPage,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? link(currentPage - 1) : null,
      nextLink: hasNextPage ? link(currentPage + 1) : null
    });
  } catch (e) { next(e); }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.pid).lean();
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: prod });
  } catch (e) { next(e); }
});

// (opcionales para cargar datos por API)
router.post('/', async (req, res, next) => {
  try { const prod = await Product.create(req.body); res.status(201).json({ status: 'success', payload: prod }); }
  catch (e) { next(e); }
});
router.put('/:pid', async (req, res, next) => {
  try { const prod = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true }); if(!prod) return res.status(404).json({ status:'error', error:'Producto no encontrado' }); res.json({ status:'success', payload: prod }); }
  catch (e) { next(e); }
});
router.delete('/:pid', async (req, res, next) => {
  try { const prod = await Product.findByIdAndDelete(req.params.pid); if(!prod) return res.status(404).json({ status:'error', error:'Producto no encontrado' }); res.json({ status:'success', message:'Producto eliminado' }); }
  catch (e) { next(e); }
});

export default router;
