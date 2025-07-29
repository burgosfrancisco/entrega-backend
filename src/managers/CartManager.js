const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor(filePath) {
    this.path = path.resolve(filePath);
  }

  async #loadFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async #saveFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async createCart() {
    const carts = await this.#loadFile();
    const newId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id: newId, products: [] };
    carts.push(newCart);
    await this.#saveFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#loadFile();
    return carts.find(c => c.id == id);
  }

  async addProductToCart(cid, pid) {
    const carts = await this.#loadFile();
    const cart = carts.find(c => c.id == cid);
    if (!cart) return null;

    const productInCart = cart.products.find(p => p.product === pid);
    if (productInCart) {
      productInCart.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.#saveFile(carts);
    return cart;
  }
}

module.exports = CartManager;

