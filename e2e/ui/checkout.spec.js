import { expect, test } from "@playwright/test";
import { adminClient, deleteProducts, seedProducts, testProducts } from "../support/seed.js";

let admin;
let products;

// BEFORE each test: seed products through the API, then open the shop.
// Each test has its own browser context, so it also starts with an empty cart.
test.beforeEach(async ({ page, playwright, baseURL }, testInfo) => {
  admin = await adminClient(playwright, baseURL);
  products = testProducts(testInfo);
  await seedProducts(admin, products);
  await page.goto("/");
});

// AFTER each test: delete the seeded products so the next run starts clean.
test.afterEach(async () => {
  await deleteProducts(admin, products);
  await admin.dispose();
});

// Buttons are labelled "Add <product name>", which is what a screen reader reads out.
const addButton = (page, product) => page.getByRole("button", { name: `Add ${product.name}` });

test("shows the seeded products with their prices", async ({ page }) => {
  const card = page.getByRole("listitem").filter({ hasText: products.labCoat.name });
  await expect(card).toContainText("₹450.00");
  await expect(addButton(page, products.vadaPav)).toBeVisible();
  // Only seeded data exists during the run: the built-in Chai is not on the page.
  await expect(page.getByRole("button", { name: "Add Chai" })).toHaveCount(0);
});

test("adding items updates the total", async ({ page }) => {
  await addButton(page, products.vadaPav).click();
  await addButton(page, products.labCoat).click();

  // ₹30 + ₹450 = ₹480, plus 18% GST (₹86.40) = ₹566.40
  await expect(page.getByRole("list", { name: "Cart items" })).toContainText(`${products.vadaPav.name} × 1`);
  await expect(page.getByTestId("subtotal")).toHaveText("₹480.00");
  await expect(page.getByTestId("total")).toHaveText("₹566.40");
});

test("a discount code lowers the total", async ({ page }) => {
  await addButton(page, products.labCoat).click();
  await page.getByLabel("Discount code").fill("fest10");
  await page.getByRole("button", { name: "Apply" }).click();

  // 10% off ₹450 = ₹45, then 18% GST on ₹405 = ₹72.90
  await expect(page.getByTestId("discount")).toHaveText("-₹45.00");
  await expect(page.getByTestId("total")).toHaveText("₹477.90");
});

test("an unknown discount code shows an error", async ({ page }) => {
  await page.getByLabel("Discount code").fill("FREE");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByRole("alert")).toHaveText("Unknown discount code: FREE");
});

test("checkout places an order and empties the cart", async ({ page }) => {
  await addButton(page, products.vadaPav).click();
  await page.getByRole("button", { name: "Checkout" }).click();

  // ₹30 vada pav + 18% GST = ₹35.40
  await expect(page.getByRole("status")).toContainText(/Order placed: ORD-\d{4} \(₹35\.40\)/);
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
});

test("checking out an empty cart is blocked", async ({ page }) => {
  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("alert")).toHaveText("Your cart is empty");
});

test("two shoppers at the same time do not see each other's carts", async ({ browser }) => {
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();
  await alice.goto("/");
  await bob.goto("/");

  await addButton(alice, products.vadaPav).click();
  await expect(alice.getByTestId("total")).toHaveText("₹35.40");

  await bob.reload();
  await expect(bob.getByText("Your cart is empty.")).toBeVisible();
  await expect(alice.getByRole("list", { name: "Cart items" })).toContainText(`${products.vadaPav.name} × 1`);

  await aliceContext.close();
  await bobContext.close();
});
