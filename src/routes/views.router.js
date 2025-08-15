import { Router } from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = Router();

// raíz
router.get('/', (req, res) => res.redirect('/products'));

// LISTADO /products con paginación + filtros + sort (y preserva cid)
router.get('/products', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query, cid } = req.query;

    const filter = {};
    if (query) {
      const [k, v] = String(query).split(':');
      if (k === 'category' && v) filter.category = v;
      if (k === 'status' && ['true','false'].includes(v)) filter.status = (v === 'true');
    }

    const lim = Math.max(parseInt(limit) || 10, 1);
    const pg  = Math.max(parseInt(page)  || 1, 1);

    let sortOpt;
    if (sort === 'asc')  sortOpt = { price: 1 };
    if (sort === 'desc') sortOpt = { price: -1 };

    const total = await Product.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);
    const currentPage = Math.min(pg, totalPages);

    const products = await Product.find(filter)
      .sort(sortOpt)
      .skip((currentPage - 1) * lim)
      .limit(lim)
      .lean();

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const buildLink = (p) => {
      const s = new URLSearchParams();
      s.set('page', p);
      s.set('limit', lim);
      if (sort)  s.set('sort', sort);
      if (query) s.set('query', query);
      if (cid)   s.set('cid', cid);
      return `/products?${s.toString()}`;
    };

    res.render('products', {
      products,
      page: currentPage,
      totalPages,
      hasPrev, hasNext,
      prevLink: hasPrev ? buildLink(currentPage - 1) : null,
      nextLink: hasNext ? buildLink(currentPage + 1) : null,
      query,
      limit: lim,
      isSortAsc: sort === 'asc',
      isSortDesc: sort === 'desc',
      cartId: cid || null
    });
  } catch (e) { next(e); }
});

// DETALLE
router.get('/products/:pid', async (req, res, next) => {
  try {
    const cid = req.query.cid || null;
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');
    res.render('product', { product, cartId: cid });
  } catch (e) { next(e); }
});

// CARRITO
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cart', { cart });
  } catch (e) { next(e); }
});

export default router;
