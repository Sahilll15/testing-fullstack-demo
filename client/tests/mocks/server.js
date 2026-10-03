import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// A fake backend at the network boundary, so components run their real fetch code.
export const products = [
  { id: "chai", name: "Chai", price: 4000 },
  { id: "notebook", name: "Notebook", price: 12000 },
];

export const emptyCart = { items: [], code: null, subtotal: 0, discount: 0, gst: 0, total: 0 };

export const handlers = [
  http.get("*/api/products", () => HttpResponse.json(products)),
  http.get("*/api/cart", () => HttpResponse.json(emptyCart)),
  http.post("*/api/cart/items", async ({ request }) => {
    const { productId } = await request.json();
    const p = products.find((x) => x.id === productId);
    const gst = Math.round(p.price * 0.18);
    return HttpResponse.json(
      { items: [{ productId, name: p.name, price: p.price, qty: 1 }], code: null, subtotal: p.price, discount: 0, gst, total: p.price + gst },
      { status: 201 },
    );
  }),
];

export const server = setupServer(...handlers);
