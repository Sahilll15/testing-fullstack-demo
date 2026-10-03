import { describe, expect, it } from "vitest";
import path from "node:path";
import { MatchersV3, PactV3 } from "@pact-foundation/pact";
import { createApi } from "../client/src/api.js";

const { eachLike, integer, like, string } = MatchersV3;

// The React app (consumer) writes down what it needs from the API.
// Running this file saves those expectations to contract/pacts/ as the contract.
const pact = new PactV3({
  consumer: "CampusCartWeb",
  provider: "CampusCartAPI",
  dir: path.resolve(import.meta.dirname, "pacts"),
});

const cartLine = { productId: string("chai"), name: string("Chai"), price: integer(4000), qty: integer(1) };
const totals = { subtotal: integer(4000), discount: integer(0), gst: integer(720), total: integer(4720) };

describe("contract: what the React app needs from the API", () => {
  it("GET /api/products gives a list with id, name and price", async () => {
    pact
      .uponReceiving("a request for all products")
      .withRequest({ method: "GET", path: "/api/products" })
      .willRespondWith({
        status: 200,
        body: eachLike({ id: string("chai"), name: string("Chai"), price: integer(4000), category: string("Beverages"), description: string("Masala chai") }),
      });

    await pact.executeTest(async (server) => {
      const products = await createApi(server.url).getProducts();
      expect(products[0]).toMatchObject({ id: "chai", name: "Chai", price: 4000 });
    });
  });

  it("GET /api/cart gives items and totals in paise", async () => {
    pact
      .uponReceiving("a request for an empty cart")
      .withRequest({ method: "GET", path: "/api/cart", headers: { "X-Cart-Id": like("cart-1") } })
      .willRespondWith({
        status: 200,
        body: { items: [], code: null, subtotal: integer(0), discount: integer(0), gst: integer(0), total: integer(0) },
      });

    await pact.executeTest(async (server) => {
      const cart = await createApi(server.url).getCart();
      expect(cart.gst).toBe(0);
    });
  });

  it("POST /api/cart/items gives back the cart with every line's price", async () => {
    pact
      .uponReceiving("a request to add chai")
      .withRequest({
        method: "POST",
        path: "/api/cart/items",
        headers: { "Content-Type": "application/json", "X-Cart-Id": like("cart-2") },
        body: { productId: "chai", qty: 1 },
      })
      .willRespondWith({
        status: 201,
        body: { items: eachLike(cartLine), code: null, ...totals },
      });

    await pact.executeTest(async (server) => {
      const cart = await createApi(server.url).addItem("chai");
      expect(cart.items[0]).toMatchObject({ productId: "chai", price: 4000, qty: 1 });
      expect(cart.total).toBe(4720);
    });
  });

  it("POST /api/checkout on an empty cart gives a 400 with a message", async () => {
    pact
      .uponReceiving("a checkout with an empty cart")
      .withRequest({ method: "POST", path: "/api/checkout", headers: { "X-Cart-Id": like("cart-3") } })
      .willRespondWith({ status: 400, body: { error: string("Your cart is empty") } });

    await pact.executeTest(async (server) => {
      await expect(createApi(server.url).checkout()).rejects.toThrow("Your cart is empty");
    });
  });
});
