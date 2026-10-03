import { expect, test } from "@playwright/test";

// Each test gets a fresh browser context, so it starts with its own empty cart.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows the products", async ({ page }) => {
  await expect(page.getByRole("button", { name: /^Add / })).toHaveCount(6);
});

test("adding items updates the total", async ({ page }) => {
  await page.getByRole("button", { name: "Add Chai" }).click();
  await page.getByRole("button", { name: "Add Notebook" }).click();

  await expect(page.getByRole("list", { name: "Cart items" })).toContainText("Chai × 1");
  await expect(page.getByTestId("subtotal")).toHaveText("₹160.00");
  await expect(page.getByTestId("total")).toHaveText("₹188.80");
});

test("a discount code lowers the total", async ({ page }) => {
  await page.getByRole("button", { name: "Add Notebook" }).click();
  await page.getByLabel("Discount code").fill("fest10");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByTestId("discount")).toHaveText("-₹12.00");
  await expect(page.getByTestId("total")).toHaveText("₹127.44");
});

test("an unknown discount code shows an error", async ({ page }) => {
  await page.getByLabel("Discount code").fill("FREE");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByRole("alert")).toHaveText("Unknown discount code: FREE");
});

test("checkout places an order and empties the cart", async ({ page }) => {
  await page.getByRole("button", { name: "Add Samosa" }).click();
  await page.getByRole("button", { name: "Checkout" }).click();

  await expect(page.getByRole("status")).toContainText(/Order placed: ORD-\d{4} \(₹29\.50\)/);
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

  await alice.getByRole("button", { name: "Add Chai" }).click();
  await expect(alice.getByTestId("total")).toHaveText("₹47.20");

  await bob.reload();
  await expect(bob.getByText("Your cart is empty.")).toBeVisible();
  await expect(alice.getByRole("list", { name: "Cart items" })).toContainText("Chai × 1");

  await aliceContext.close();
  await bobContext.close();
});
