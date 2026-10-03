import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductList } from "../src/components/ProductList.jsx";

const products = [
  { id: "chai", name: "Chai", price: 4000, category: "Beverages", description: "Kadak masala chai." },
  { id: "samosa", name: "Samosa", price: 2500, category: "Snacks", description: "Crispy aloo samosa." },
];

describe("ProductList", () => {
  it("shows a card for every product", () => {
    render(<ProductList products={products} onAdd={() => {}} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows name, price, category and description", () => {
    render(<ProductList products={products} onAdd={() => {}} />);
    expect(screen.getByRole("heading", { name: "Chai" })).toBeInTheDocument();
    expect(screen.getByText("₹40.00")).toBeInTheDocument();
    expect(screen.getByText("Beverages")).toBeInTheDocument();
    expect(screen.getByText("Kadak masala chai.")).toBeInTheDocument();
  });

  it("sends the product id when Add is clicked", async () => {
    const onAdd = vi.fn();
    render(<ProductList products={products} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "Add Samosa" }));
    expect(onAdd).toHaveBeenCalledWith("samosa");
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows placeholders while loading, not products", () => {
    const { container } = render(<ProductList products={products} loading onAdd={() => {}} />);
    expect(container.querySelectorAll(".skeleton")).toHaveLength(6);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("says so when nothing matches the search", () => {
    render(<ProductList products={[]} onAdd={() => {}} />);
    expect(screen.getByText("No products match your search.")).toBeInTheDocument();
  });
});
