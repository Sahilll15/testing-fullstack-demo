import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../src/components/Header.jsx";

describe("Header", () => {
  it("shows the shop name", () => {
    render(<Header query="" onQuery={() => {}} count={0} />);
    expect(screen.getByText("Campus Cart")).toBeInTheDocument();
  });

  it.each([
    [0, "Cart, 0 items"],
    [1, "Cart, 1 item"],
    [3, "Cart, 3 items"],
  ])("labels the cart for screen readers with %s items", (count, label) => {
    render(<Header query="" onQuery={() => {}} count={count} />);
    expect(screen.getByRole("link", { name: label })).toHaveTextContent(String(count));
  });

  it("reports every letter typed in the search box", async () => {
    const onQuery = vi.fn();
    render(<Header query="" onQuery={onQuery} count={0} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Search products" }), "tea");
    expect(onQuery).toHaveBeenCalledTimes(3);
    expect(onQuery).toHaveBeenLastCalledWith("a");
  });
});
