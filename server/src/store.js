// In-memory data. A fresh store per test keeps tests independent of each other.

export const PRODUCTS = [
  { id: "coffee", name: "Coffee", price: 450 },
  { id: "bagel", name: "Bagel", price: 300 },
  { id: "notebook", name: "Notebook", price: 1200 },
];

export function createStore() {
  const carts = new Map();
  let nextOrder = 1;

  function getCart(cartId) {
    if (!carts.has(cartId)) carts.set(cartId, { items: [], code: null });
    return carts.get(cartId);
  }

  return {
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
