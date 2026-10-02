import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTS, createStore } from "./store.js";
import { calculateDiscount, calculateTotal } from "./pricing.js";

// In production Express serves the built React app from client/dist.
const clientDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "client", "dist");

export function createApp(store = createStore()) {
  const app = express();
  app.use(express.json());

  // Each browser tab sends its own cart id, so two users never share a cart.
  function cartId(req, res) {
    const id = req.get("X-Cart-Id");
    if (!id) res.status(400).json({ error: "Missing X-Cart-Id header" });
    return id;
  }

  function summary(cart) {
    const items = cart.items.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.productId);
      return { productId: p.id, name: p.name, price: p.price, qty: i.qty };
    });
    return { items, code: cart.code, ...calculateTotal(items, cart.code) };
  }

  app.get("/api/products", (_req, res) => res.json(PRODUCTS));

  app.get("/api/cart", (req, res) => {
    const id = cartId(req, res);
    if (id) res.json(summary(store.getCart(id)));
  });

  app.post("/api/cart/items", (req, res) => {
    const id = cartId(req, res);
    if (!id) return;
    const { productId, qty = 1 } = req.body ?? {};
    if (!PRODUCTS.some((p) => p.id === productId)) {
      return res.status(404).json({ error: `Unknown product: ${productId}` });
    }
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: "Quantity must be a whole number above 0" });
    }
    res.status(201).json(summary(store.addItem(id, productId, qty)));
  });

  app.delete("/api/cart/items/:productId", (req, res) => {
    const id = cartId(req, res);
    if (id) res.json(summary(store.removeItem(id, req.params.productId)));
  });

  app.post("/api/cart/discount", (req, res) => {
    const id = cartId(req, res);
    if (!id) return;
    const code = req.body?.code;
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ error: "Enter a discount code" });
    }
    try {
      calculateDiscount(0, code);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
    store.setCode(id, code.trim().toUpperCase());
    res.json(summary(store.getCart(id)));
  });

  app.post("/api/checkout", (req, res) => {
    const id = cartId(req, res);
    if (!id) return;
    const cart = summary(store.getCart(id));
    if (cart.items.length === 0) return res.status(400).json({ error: "Your cart is empty" });
    res.status(201).json({ orderId: store.placeOrder(id), total: cart.total });
  });

  app.use(express.static(clientDir));
  return app;
}
