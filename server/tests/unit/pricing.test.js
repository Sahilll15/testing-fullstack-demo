import { describe, expect, it } from "vitest";
import { calculateDiscount, calculateSubtotal, calculateTax, calculateTotal, formatMoney } from "../../src/pricing.js";

const coffee = { price: 450, qty: 2 };
const notebook = { price: 1200, qty: 1 };

describe("calculateSubtotal", () => {
  it("adds price times quantity for every item", () => {
    expect(calculateSubtotal([coffee, notebook])).toBe(2100);
  });

  it("returns 0 for an empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it.each([0, -1, 1.5])("rejects quantity %s", (qty) => {
    expect(() => calculateSubtotal([{ price: 100, qty }])).toThrow("Invalid quantity");
  });

  it("rejects a negative price", () => {
    expect(() => calculateSubtotal([{ price: -5, qty: 1 }])).toThrow("Invalid price");
  });
});

describe("calculateDiscount", () => {
  it.each([
    ["SAVE10 takes 10% off", 2000, "SAVE10", 200],
    ["codes ignore case and spaces", 2000, " save10 ", 200],
    ["FLAT5 takes $5 off orders of $20 or more", 2000, "FLAT5", 500],
    ["FLAT5 does nothing below $20", 1999, "FLAT5", 0],
    ["no code means no discount", 2000, undefined, 0],
  ])("%s", (_name, subtotal, code, expected) => {
    expect(calculateDiscount(subtotal, code)).toBe(expected);
  });

  it("never discounts more than the subtotal", () => {
    expect(calculateDiscount(100, "SAVE10")).toBeLessThanOrEqual(100);
  });

  it("rejects an unknown code", () => {
    expect(() => calculateDiscount(2000, "FREE")).toThrow("Unknown discount code");
  });
});

describe("calculateTax", () => {
  it("charges 10% and rounds to the nearest cent", () => {
    expect(calculateTax(1005)).toBe(101);
  });
});

describe("calculateTotal", () => {
  it("applies the discount before tax", () => {
    expect(calculateTotal([coffee, notebook], "SAVE10")).toEqual({
      subtotal: 2100,
      discount: 210,
      tax: 189,
      total: 2079,
    });
  });
});

describe("formatMoney", () => {
  it("shows cents as dollars", () => {
    expect(formatMoney(2079)).toBe("$20.79");
  });
});
