import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cart } from "../src/components/Cart.jsx";

const cart = {
  items: [{ productId: "chai", name: "Chai", price: 4000, qty: 2 }],
  subtotal: 8000,
  discount: 800,
  gst: 1296,
  total: 8496,
};

describe("Cart", () => {
  it("tells the user when the cart is empty", () => {
    render(<Cart cart={{ ...cart, items: [] }} onRemove={() => {}} />);
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("shows each item and the totals", () => {
    render(<Cart cart={cart} onRemove={() => {}} />);
    expect(screen.getByRole("list", { name: "Cart items" })).toHaveTextContent("Chai × 2");
    expect(screen.getByTestId("discount")).toHaveTextContent("-₹8.00");
    expect(screen.getByTestId("total")).toHaveTextContent("₹84.96");
  });

  it("asks to remove the item the user clicked", async () => {
    const onRemove = vi.fn();
    render(<Cart cart={cart} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Chai" }));
    expect(onRemove).toHaveBeenCalledWith("chai");
  });
});
