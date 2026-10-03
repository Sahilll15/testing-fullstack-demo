import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server.js";
import App from "../src/App.jsx";

// The whole React app, with the network faked by MSW.
describe("App", () => {
  it("should loads products from the API", async () => {
    render(<App />);
    expect(await screen.findByRole("button", { name: "Add Chai" })).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("should show the new total after adding an item", async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Add Notebook" }));
    expect(await screen.findByTestId("total")).toHaveTextContent("₹141.60");
  });

  it("should send the cart id header on every request", async () => {
    const seen = [];
    server.events.on("request:start", ({ request }) => seen.push(request.headers.get("X-Cart-Id")));
    render(<App />);
    await screen.findByRole("button", { name: "Add Chai" });
    expect(seen.length).toBeGreaterThan(0);
    expect(new Set(seen).size).toBe(1);
    server.events.removeAllListeners();
  });

  it("shows the server's message when a discount code is rejected", async () => {
    server.use(
      http.post("*/api/cart/discount", () => HttpResponse.json({ error: "Unknown discount code: FREE" }, { status: 400 })),
    );
    render(<App />);
    await userEvent.type(await screen.findByLabelText("Discount code"), "FREE{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Unknown discount code: FREE");
  });

  it("shows an error if the server is down", async () => {
    server.use(http.get("*/api/products", () => new HttpResponse(null, { status: 500 })));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Request failed (500)");
  });

  it("filters products as you search", async () => {
    render(<App />);
    await screen.findByRole("button", { name: "Add Chai" });
    await userEvent.type(screen.getByRole("searchbox", { name: "Search products" }), "note");
    expect(screen.getByRole("button", { name: "Add Notebook" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Chai" })).not.toBeInTheDocument();
  });

  it("updates the cart badge after adding", async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Add Chai" }));
    expect(await screen.findByRole("link", { name: "Cart, 1 item" })).toBeInTheDocument();
  });

  it("shows the order number after checkout", async () => {
    server.use(http.post("*/api/checkout", () => HttpResponse.json({ orderId: "ORD-0007", total: 4720 }, { status: 201 })));
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Checkout" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Order placed: ORD-0007 (₹47.20)");
  });

  it("shows which discount code is applied", async () => {
    server.use(
      http.post("*/api/cart/discount", () =>
        HttpResponse.json({ items: [], code: "FEST10", subtotal: 0, discount: 0, gst: 0, total: 0 }),
      ),
    );
    render(<App />);
    await userEvent.type(await screen.findByLabelText("Discount code"), "fest10{Enter}");
    expect(await screen.findByText("Code FEST10 applied")).toBeInTheDocument();
  });
});
