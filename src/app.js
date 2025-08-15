import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import exphbs from 'express-handlebars';
import morgan from 'morgan';
import cors from 'cors';
import methodOverride from 'method-override';

import { connectDB } from './db.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Vistas
app.use('/', viewsRouter);

// Errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 400).json({ status: 'error', error: err.message || 'Error' });
});

const PORT = process.env.PORT || 8080;

// ❗ Conectamos a Mongo UNA sola vez y recién después levantamos el server
connectDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`)))
  .catch(err => {
    console.error('❌ No se pudo iniciar el server:', err);
    process.exit(1);
  });
