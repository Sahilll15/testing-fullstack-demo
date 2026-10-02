import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server.js";
import App from "../src/App.jsx";

// The whole React app, with the network faked by MSW.
describe("App", () => {
  it("loads products from the API", async () => {
    render(<App />);
    expect(await screen.findByRole("button", { name: "Add Coffee" })).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("shows the new total after adding an item", async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Add Notebook" }));
    expect(await screen.findByTestId("total")).toHaveTextContent("$13.20");
  });

  it("sends the cart id header on every request", async () => {
    const seen = [];
    server.events.on("request:start", ({ request }) => seen.push(request.headers.get("X-Cart-Id")));
    render(<App />);
    await screen.findByRole("button", { name: "Add Coffee" });
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
});
