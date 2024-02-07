import { promises as fsPromises } from "fs"

class ProductManager {

  constructor(path) {
    this.path = path
    this.products = []
  }

  async addProduct(title, description, price, thumbnail, code, stock) {
    try {
      if (!this.products) {
        await this.readProducts()
      }

      const productExists = this.products.some(i => i.code === code)

      if (productExists) {
        console.error("Product already exist")
        return
      }

      if (!title || !description || !price || !thumbnail || !code || !stock) {
        console.error("Product missing fields")
        return
      }

      let maxId = this.products.length > 0 ? Math.max(...this.products.map(i => i.id)) : 0
      const id = maxId + 1

      const newProduct = {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        id
      }

      this.products.push(newProduct)
      await this.writeProducts(this.products)

    } catch (error) {
      console.error("Product could not be added", error)
    }
  }

  async readProducts() {
    try {
      const response = await fsPromises.readFile(this.path, "utf-8")
      const products = JSON.parse(response)
      this.products = products
    } catch (error) {
      this.products = []
    }
  }

  async writeProducts(newProducts) {
    try {
      await fsPromises.writeFile(this.path, JSON.stringify(newProducts, null, 2))
    } catch (error) {
      console.error("Products could not be written", error)
    }
  }

  async getProducts() {
      await this.readProducts()
      console.log(this.products)
  }

  async getProductById(id) {
    try {
      await this.readProducts()
      const product = this.products.find(i => i.id === id)
      if (!product) {
        throw new Error("Product not found")
      }
      console.log("Product found: ", product)
    } catch (error) {
      console.error(error)
    }
  }

  async updateProduct(id, updatedProduct) {
    try {
      await this.readProducts()
      const productIndex = this.products.findIndex(i => i.id === id)

      if (productIndex === -1) {
        console.error("Product not found for update")
        return
      }

      this.products[productIndex] = {
        ...this.products[productIndex],
        ...updatedProduct,
        id: this.products[productIndex].id
      };

      await this.writeProducts(this.products);

    } catch (error) {
      console.error("Error updating product", error)
    }
  }

  async deleteProduct(id) {
    await this.readProducts()
    const filteredProducts = this.products.filter(i => i.id != id)
    await this.writeProducts(filteredProducts)
  }

}

////////////////////Testing///////////////////////

const newProductManager = new ProductManager("./ProductManager.json");

(async () => {
  await newProductManager.getProducts()
  await newProductManager.addProduct("Producto prueba", "Este es un producto prueba", 200, "sin imagen", "abc123", 25)
  await newProductManager.getProducts()
  await newProductManager.getProductById(1)
  await newProductManager.updateProduct(1, {
    title: "Nuevo nombre",
    price: 300,
    stock: 50
  })
  await newProductManager.deleteProduct(1)
})()
