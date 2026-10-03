import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStore } from "./store.js";
import { calculateDiscount, calculateTotal } from "./pricing.js";

// In production Express serves the built React app from client/dist.
const clientDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "client", "dist");

export function createApp(store = createStore(), { adminKey } = {}) {
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
      const p = store.findProduct(i.productId);
      return { productId: p.id, name: p.name, price: p.price, qty: i.qty };
    });
    return { items, code: cart.code, ...calculateTotal(items, cart.code) };
  }

  app.get("/api/products", (_req, res) => res.json(store.listProducts()));

  // Admin routes, used by automation tests to seed and clean up data.
  // They only exist when the server is started with ADMIN_KEY set.
  function isAdmin(req, res) {
    if (adminKey && req.get("X-Admin-Key") === adminKey) return true;
    res.status(403).json({ error: "Admin key required" });
    return false;
  }

  app.post("/api/admin/products", (req, res) => {
    if (!isAdmin(req, res)) return;
    const { id, name, price, category, description } = req.body ?? {};
    if (typeof id !== "string" || typeof name !== "string" || !Number.isInteger(price) || price < 0) {
      return res.status(400).json({ error: "id, name and a whole-paise price are required" });
    }
    if (store.findProduct(id)) return res.status(409).json({ error: `Product already exists: ${id}` });
    res.status(201).json(store.addProduct({ id, name, price, category, description }));
  });

  app.delete("/api/admin/products/:id", (req, res) => {
    if (!isAdmin(req, res)) return;
    if (!store.deleteProduct(req.params.id)) return res.status(404).json({ error: "No such product" });
    res.status(204).end();
  });

  app.get("/api/cart", (req, res) => {
    const id = cartId(req, res);
    if (id) res.json(summary(store.getCart(id)));
  });

  app.post("/api/cart/items", (req, res) => {
    const id = cartId(req, res);
    if (!id) return;
    const { productId, qty = 1 } = req.body ?? {};
    if (!store.findProduct(productId)) {
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
