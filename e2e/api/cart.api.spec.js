import { expect, test as base } from "@playwright/test";
import { adminClient, deleteProducts, seedProducts, testProducts } from "../support/seed.js";

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

let admin;
let products;

// BEFORE each test: create fresh products that only this test uses.
test.beforeEach(async ({ playwright, baseURL }, testInfo) => {
  admin = await adminClient(playwright, baseURL);
  products = testProducts(testInfo);
  await seedProducts(admin, products);
});


//before test -> runs before the tests and is used to add the seeded data to the application
//test assertion where in the real test assertion comes into the picture
//after test-> runs after the tests and is used to cleanup the test data we have created



// AFTER each test: delete what we created, even if the test failed.
test.afterEach(async () => {
  await deleteProducts(admin, products);
  await admin.dispose();
});

test("the seeded products show up in the catalogue", async ({ request }) => {
  const res = await request.get("/api/products");
  expect(res.status()).toBe(200);
  const catalogue = await res.json();
  expect(catalogue).toContainEqual(products.vadaPav);
  // The server starts empty, so none of the shop's built-in products are here.
  expect(catalogue.map((p) => p.id)).not.toContain("chai");
});

test("a full shopping flow over HTTP", async ({ request }) => {
  // 2 lab coats at ₹450 = ₹900, so FLAT50 (₹50 off orders of ₹500+) applies.
  await request.post("/api/cart/items", { data: { productId: products.labCoat.id, qty: 2 } });

  const discounted = await request.post("/api/cart/discount", { data: { code: "FLAT50" } });
  expect(await discounted.json()).toMatchObject({ subtotal: 90000, discount: 5000, gst: 15300, total: 100300 });

  const order = await request.post("/api/checkout");
  expect(order.status()).toBe(201);
  expect(await order.json()).toMatchObject({ orderId: expect.stringMatching(/^ORD-\d{4}$/), total: 100300 });

  const cart = await request.get("/api/cart");
  expect((await cart.json()).items).toHaveLength(0);
});

test("bad input gets a clear 4xx error", async ({ request }) => {
  const unknown = await request.post("/api/cart/items", { data: { productId: "laptop" } });
  expect(unknown.status()).toBe(404);

  const badQty = await request.post("/api/cart/items", { data: { productId: products.vadaPav.id, qty: 0 } });
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

test("only callers with the admin key can seed data", async ({ request }) => {
  const res = await request.post("/api/admin/products", { data: { id: "hack", name: "Hack", price: 1 } });
  expect(res.status()).toBe(403);
});
