const fs = require('fs').promises;
const path = require('path');

class ProductManager {
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

  async getProducts() {
    return await this.#loadFile();
  }

  async getProductById(id) {
    const products = await this.#loadFile();
    return products.find(p => p.id == id);
  }

  async addProduct(product) {
    const products = await this.#loadFile();
    const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    const newProduct = { id: newId, ...product };
    products.push(newProduct);
    await this.#saveFile(products);
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.#loadFile();
    const index = products.findIndex(p => p.id == id);
    if (index === -1) return null;

    delete updatedFields.id;
    products[index] = { ...products[index], ...updatedFields };

    await this.#saveFile(products);
    return products[index];
  }
  async deleteProduct(id) {
    const products = await this.#loadFile();
    const newProducts = products.filter(p => p.id != id);
    if (newProducts.length === products.length) return false;

    await this.#saveFile(newProducts);
    return true;
  }
}
module.exports = ProductManager;
