import { describe, expect, it } from "vitest";
import { calculateDiscount, calculateGst, calculateSubtotal, calculateTotal, formatMoney } from "../../src/pricing.js";

// Prices are in paise: ₹40 is 4000.
const chai = { price: 4000, qty: 2 };
const notebook = { price: 12000, qty: 1 };

describe("calculateSubtotal", () => {
  it("adds price times quantity for every item", () => {
    expect(calculateSubtotal([chai, notebook])).toBe(20000);
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
    ["FEST10 takes 10% off", 20000, "FEST10", 2000],
    ["codes ignore case and spaces", 20000, " fest10 ", 2000],
    ["FLAT50 takes ₹50 off orders of ₹500 or more", 50000, "FLAT50", 5000],
    ["FLAT50 does nothing below ₹500", 49999, "FLAT50", 0],
    ["no code means no discount", 20000, undefined, 0],
  ])("%s", (_name, subtotal, code, expected) => {
    expect(calculateDiscount(subtotal, code)).toBe(expected);
  });

  it("never discounts more than the subtotal", () => {
    expect(calculateDiscount(100, "FEST10")).toBeLessThanOrEqual(100);
  });

  it("rejects an unknown code", () => {
    expect(() => calculateDiscount(20000, "FREE")).toThrow("Unknown discount code");
  });
});

describe("calculateGst", () => {
  it("charges 18% and rounds to the nearest paisa", () => {
    expect(calculateGst(1005)).toBe(181);
  });
});

describe("calculateTotal", () => {
  it("applies the discount before GST", () => {
    expect(calculateTotal([chai, notebook], "FEST10")).toEqual({
      subtotal: 20000,
      discount: 2000,
      gst: 3240,
      total: 21240,
    });
  });
});

describe("formatMoney", () => {
  it("shows paise as rupees", () => {
    expect(formatMoney(21240)).toBe("₹212.40");
  });

  it("uses Indian digit grouping", () => {
    expect(formatMoney(12345678)).toBe("₹1,23,456.78");
  });
});
