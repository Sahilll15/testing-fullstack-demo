import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server.js";
import { api } from "../src/api.js";

describe("api", () => {
  it("creates one cart id and reuses it for every request", async () => {
    const ids = [];
    server.events.on("request:start", ({ request }) => ids.push(request.headers.get("X-Cart-Id")));
    await api.getProducts();
    await api.getCart();
    server.events.removeAllListeners();

    expect(ids[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(ids[1]).toBe(ids[0]);
    expect(sessionStorage.getItem("cartId")).toBe(ids[0]);
  });

  it("sends the product id and quantity when adding", async () => {
    let body;
    server.use(
      http.post("*/api/cart/items", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ items: [] }, { status: 201 });
      }),
    );
    await api.addItem("samosa");
    expect(body).toEqual({ productId: "samosa", qty: 1 });
  });

  it("calls DELETE with the product id when removing", async () => {
    let url;
    server.use(
      http.delete("*/api/cart/items/:id", ({ request }) => {
        url = new URL(request.url).pathname;
        return HttpResponse.json({ items: [] });
      }),
    );
    await api.removeItem("chai");
    expect(url).toBe("/api/cart/items/chai");
  });

  it("throws the server's error message", async () => {
    server.use(http.post("*/api/checkout", () => HttpResponse.json({ error: "Your cart is empty" }, { status: 400 })));
    await expect(api.checkout()).rejects.toThrow("Your cart is empty");
  });

  it("throws a general message when the server sends no JSON", async () => {
    server.use(http.get("*/api/cart", () => new HttpResponse("Bad gateway", { status: 502 })));
    await expect(api.getCart()).rejects.toThrow("Request failed (502)");
  });
});
