// In-memory data. A fresh store per test keeps tests independent of each other.

export const PRODUCTS = [
  { id: "chai", name: "Chai", price: 4000, category: "Beverages", description: "Kadak masala chai with ginger and elaichi, 250 ml." },
  { id: "samosa", name: "Samosa", price: 2500, category: "Snacks", description: "Crispy aloo samosa with green chutney." },
  { id: "notebook", name: "Notebook", price: 12000, category: "Stationery", description: "200-page ruled notebook for lab records." },
  { id: "bottle", name: "Bottle", price: 35000, category: "Hostel", description: "Steel bottle that keeps water cold for 12 hours." },
  { id: "tote", name: "Tote", price: 29900, category: "Accessories", description: "Canvas tote that fits a laptop and books." },
  { id: "earphones", name: "Earphones", price: 79900, category: "Gadgets", description: "Wired earphones with mic for online classes." },
];

export function createStore() {
  const products = PRODUCTS.map((p) => ({ ...p }));
  const carts = new Map();
  let nextOrder = 1;

  function getCart(cartId) {
    if (!carts.has(cartId)) carts.set(cartId, { items: [], code: null });
    return carts.get(cartId);
  }

  return {
    listProducts: () => products,
    findProduct: (id) => products.find((p) => p.id === id),
    addProduct(product) {
      products.push(product);
      return product;
    },
    deleteProduct(id) {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) return false;
      products.splice(index, 1);
      // A deleted product must not stay behind in anyone's cart.
      for (const cart of carts.values()) cart.items = cart.items.filter((i) => i.productId !== id);
      return true;
    },
    getCart,
    addItem(cartId, productId, qty) {
      const cart = getCart(cartId);
      const line = cart.items.find((i) => i.productId === productId);
      if (line) line.qty += qty;
      else cart.items.push({ productId, qty });
      return cart;
    },
    removeItem(cartId, productId) {
      const cart = getCart(cartId);
      cart.items = cart.items.filter((i) => i.productId !== productId);
      return cart;
    },
    setCode(cartId, code) {
      getCart(cartId).code = code;
    },
    placeOrder(cartId) {
      carts.delete(cartId);
      return `ORD-${String(nextOrder++).padStart(4, "0")}`;
    },
  };
}
