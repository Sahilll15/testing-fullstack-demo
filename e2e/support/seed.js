import { ADMIN_KEY } from "./admin-key.js";

// Test data is created through the admin API, never by clicking through the UI.
// It is fast, and every test knows exactly what data it starts with.

// Each test gets its own ids, so tests running in parallel never clash.
export function uniqueSuffix(testInfo) {
  return `${testInfo.workerIndex}-${testInfo.testId.slice(0, 6)}`;
}

export function testProducts(testInfo) {
  const s = uniqueSuffix(testInfo);
  return {
    vadaPav: { id: `vada-pav-${s}`, name: `Vada Pav ${s}`, price: 3000, category: "Snacks", description: "Seeded by a test." },
    labCoat: { id: `lab-coat-${s}`, name: `Lab Coat ${s}`, price: 45000, category: "Stationery", description: "Seeded by a test." },
  };
}

// An API client that sends the admin key on every request.
export async function adminClient(playwright, baseURL) {
  return playwright.request.newContext({ baseURL, extraHTTPHeaders: { "X-Admin-Key": ADMIN_KEY } });
}

export async function seedProducts(admin, products) {
  for (const product of Object.values(products)) {
    const res = await admin.post("/api/admin/products", { data: product });
    if (res.status() !== 201) throw new Error(`Seeding ${product.id} failed: ${res.status()} ${await res.text()}`);
  }
}

export async function deleteProducts(admin, products) {
  for (const product of Object.values(products)) {
    const res = await admin.delete(`/api/admin/products/${product.id}`);
    if (res.status() !== 204) throw new Error(`Cleanup of ${product.id} failed: ${res.status()}`);
  }
}
