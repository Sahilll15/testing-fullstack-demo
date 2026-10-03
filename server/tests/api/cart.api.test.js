import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { createStore } from "../../src/store.js";

// These tests run the real Express app and pricing code together, with no mocks.
let app;
beforeEach(() => {
  app = createApp(createStore());
});

const asUser = (cartId) => ({
  get: (url) => request(app).get(url).set("X-Cart-Id", cartId),
  post: (url, body) => request(app).post(url).set("X-Cart-Id", cartId).send(body),
  delete: (url) => request(app).delete(url).set("X-Cart-Id", cartId),
});

describe("cart API", () => {
  it("lists products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.id)).toEqual(["chai", "samosa", "notebook", "bottle", "tote", "earphones"]);
  });

  it("adds items and returns updated totals", async () => {
    const user = asUser("alice");
    await user.post("/api/cart/items", { productId: "chai", qty: 2 });
    const res = await user.post("/api/cart/items", { productId: "notebook" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ subtotal: 20000, gst: 3600, total: 23600 });
  });

  it("merges repeat adds of the same product into one line", async () => {
    const user = asUser("alice");
    await user.post("/api/cart/items", { productId: "samosa" });
    const res = await user.post("/api/cart/items", { productId: "samosa" });
    expect(res.body.items).toEqual([expect.objectContaining({ productId: "samosa", qty: 2 })]);
  });

  it("removes an item", async () => {
    const user = asUser("alice");
    await user.post("/api/cart/items", { productId: "samosa" });
    const res = await user.delete("/api/cart/items/samosa");
    expect(res.body.items).toHaveLength(0);
  });

  it("applies a valid discount code", async () => {
    const user = asUser("alice");
    await user.post("/api/cart/items", { productId: "notebook", qty: 5 });
    const res = await user.post("/api/cart/discount", { code: "flat50" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ code: "FLAT50", discount: 5000 });
  });

  it("rejects an unknown discount code", async () => {
    const res = await asUser("alice").post("/api/cart/discount", { code: "FREE" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Unknown discount code/);
  });

  it("rejects an unknown product", async () => {
    const res = await asUser("alice").post("/api/cart/items", { productId: "laptop" });
    expect(res.status).toBe(404);
  });

  it("rejects a request without a cart id", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(400);
  });

  it("will not check out an empty cart", async () => {
    const res = await asUser("alice").post("/api/checkout");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Your cart is empty");
  });

  it("checks out and empties the cart", async () => {
    const user = asUser("alice");
    await user.post("/api/cart/items", { productId: "chai" });
    const order = await user.post("/api/checkout");
    expect(order.status).toBe(201);
    expect(order.body).toEqual({ orderId: "ORD-0001", total: 4720 });

    const cart = await user.get("/api/cart");
    expect(cart.body.items).toHaveLength(0);
  });

  it("keeps two users' carts separate", async () => {
    await asUser("alice").post("/api/cart/items", { productId: "chai" });
    const bob = await asUser("bob").get("/api/cart");
    expect(bob.body.items).toHaveLength(0);
  });
});
