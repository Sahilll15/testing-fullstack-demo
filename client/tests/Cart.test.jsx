import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cart } from "../src/components/Cart.jsx";

const cart = {
  items: [{ productId: "coffee", name: "Coffee", price: 450, qty: 2 }],
  subtotal: 900,
  discount: 90,
  tax: 81,
  total: 891,
};

describe("Cart", () => {
  it("tells the user when the cart is empty", () => {
    render(<Cart cart={{ ...cart, items: [] }} onRemove={() => {}} />);
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("shows each item and the totals", () => {
    render(<Cart cart={cart} onRemove={() => {}} />);
    expect(screen.getByRole("list", { name: "Cart items" })).toHaveTextContent("Coffee × 2");
    expect(screen.getByTestId("discount")).toHaveTextContent("-$0.90");
    expect(screen.getByTestId("total")).toHaveTextContent("$8.91");
  });

  it("asks to remove the item the user clicked", async () => {
    const onRemove = vi.fn();
    render(<Cart cart={cart} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Coffee" }));
    expect(onRemove).toHaveBeenCalledWith("coffee");
  });
});
