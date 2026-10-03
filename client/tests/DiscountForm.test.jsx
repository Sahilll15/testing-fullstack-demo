import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiscountForm } from "../src/components/DiscountForm.jsx";

describe("DiscountForm", () => {
  it("keeps Apply disabled until a code is typed", async () => {
    render(<DiscountForm onApply={() => {}} />);
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(apply).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Discount code"), "FEST10");
    expect(apply).toBeEnabled();
  });

  it("sends the typed code", async () => {
    const onApply = vi.fn();
    render(<DiscountForm onApply={onApply} />);
    await userEvent.type(screen.getByLabelText("Discount code"), "FEST10{Enter}");
    expect(onApply).toHaveBeenCalledWith("FEST10");
  });

  it("does not allow a code made only of spaces", async () => {
    render(<DiscountForm onApply={() => {}} />);
    await userEvent.type(screen.getByLabelText("Discount code"), "   ");
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("shows the applied code when there is one", () => {
    render(<DiscountForm onApply={() => {}} applied="FEST10" />);
    expect(screen.getByText("Code FEST10 applied")).toBeInTheDocument();
  });
});
