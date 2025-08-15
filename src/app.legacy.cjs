const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');

const productRouter = require('./routes/product.router');
const cartRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const ProductManager = require('./managers/ProductManager');
const productManager = new ProductManager('./src/data/products.json');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);

// Servidor HTTP + WebSocket
const httpServer = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

const io = new Server(httpServer);
app.set('io', io);

// WebSocket connection
io.on('connection', async socket => {
  console.log('🟢 Nuevo cliente conectado');

  socket.emit('products', await productManager.getProducts());

  socket.on('newProduct', async product => {
    await productManager.addProduct(product);
    io.emit('products', await productManager.getProducts());
  });

  socket.on('deleteProduct', async id => {
    await productManager.deleteProduct(id);
    io.emit('products', await productManager.getProducts());
  });
});
