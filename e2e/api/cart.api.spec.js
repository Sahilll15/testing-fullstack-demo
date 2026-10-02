import { expect, test as base } from "@playwright/test";

// API automation against the real running server. Each test gets its own cart id,
// so tests can run in parallel without touching each other's carts.
const test = base.extend({
  request: async ({ playwright, baseURL }, use, testInfo) => {
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { "X-Cart-Id": `api-${testInfo.testId}` },
    });
    await use(ctx);
    await ctx.dispose();
  },
});

test("GET /api/products returns the catalogue", async ({ request }) => {
  const res = await request.get("/api/products");
  expect(res.status()).toBe(200);
  expect(await res.json()).toHaveLength(3);
});

test("a full shopping flow over HTTP", async ({ request }) => {
  await request.post("/api/cart/items", { data: { productId: "notebook", qty: 2 } });

  const discounted = await request.post("/api/cart/discount", { data: { code: "FLAT5" } });
  expect(await discounted.json()).toMatchObject({ subtotal: 2400, discount: 500, tax: 190, total: 2090 });

  const order = await request.post("/api/checkout");
  expect(order.status()).toBe(201);
  expect(await order.json()).toMatchObject({ orderId: expect.stringMatching(/^ORD-\d{4}$/), total: 2090 });

  const cart = await request.get("/api/cart");
  expect((await cart.json()).items).toHaveLength(0);
});

test("bad input gets a clear 4xx error", async ({ request }) => {
  const unknown = await request.post("/api/cart/items", { data: { productId: "laptop" } });
  expect(unknown.status()).toBe(404);

  const badQty = await request.post("/api/cart/items", { data: { productId: "coffee", qty: 0 } });
  expect(badQty.status()).toBe(400);

  const empty = await request.post("/api/checkout");
  expect(await empty.json()).toEqual({ error: "Your cart is empty" });
});

test("requests without a cart id are rejected", async ({ playwright, baseURL }) => {
  const bare = await playwright.request.newContext({ baseURL });
  const res = await bare.get("/api/cart");
  expect(res.status()).toBe(400);
  await bare.dispose();
});
