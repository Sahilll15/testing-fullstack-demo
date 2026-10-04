import { describe, expect, it } from "vitest";
import { calculateDiscount, calculateGst, calculateSubtotal, calculateTotal, formatMoney } from "../../src/pricing.js";

// Prices are in paise: ₹40 is 4000.
const chai = { price: 40, qty: 2 };
const notebook = { price: 12000, qty: 1 };


describe("calculateSubtotal", () => {
  it("adds price times quantity for every item", () => {
    expect(calculateSubtotal([chai, notebook])).toBe(12080);
  });

  it("returns 0 for an empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("handles many items", () => {
    const items = [{ price: 2500, qty: 4 }, { price: 4000, qty: 3 }, { price: 29900, qty: 1 }];
    expect(calculateSubtotal(items)).toBe(10000 + 12000 + 29900);
  });

  it("allows a free item", () => {
    expect(calculateSubtotal([{ price: 0, qty: 3 }])).toBe(0);
  });

  it.each([0, -1, 1.5])("rejects quantity %s", (qty) => {
    expect(() => calculateSubtotal([{ price: 100, qty }])).toThrow("Invalid quantity");
  });

  it("rejects a price in rupees with decimals instead of paise", () => {
    expect(() => calculateSubtotal([{ price: 40.5, qty: 1 }])).toThrow("Invalid price");
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

  it("is zero on a zero amount", () => {
    expect(calculateGst(0)).toBe(0);
  });

  it("accepts a different rate", () => {
    expect(calculateGst(10000, 0.05)).toBe(500);
  });

  it.each([
    [2, 0],
    [3, 1],
    [997, 179],
  ])("rounds %s paise of GST base to %s", (amount, expected) => {
    expect(calculateGst(amount)).toBe(expected);
  });
});

describe("calculateTotal", () => {
  it("is all zeros for an empty cart", () => {
    expect(calculateTotal([])).toEqual({ subtotal: 0, discount: 0, gst: 0, total: 0 });
  });

  it("adds GST when there is no discount", () => {
    expect(calculateTotal([chai])).toEqual({ subtotal: 80, discount: 0, gst: 14, total: 94 });
  });

  it("applies FLAT50 on a big order", () => {
    expect(calculateTotal([{ price: 12000, qty: 5 }], "FLAT50")).toEqual({
      subtotal: 60000,
      discount: 5000,
      gst: 9900,
      total: 64900,
    });
  });

  it("throws for an unknown code instead of silently ignoring it", () => {
    expect(() => calculateTotal([chai], "FREE")).toThrow("Unknown discount code");
  });

  it("applies the discount before GST", () => {
    expect(calculateTotal([chai, notebook], "FEST10")).toEqual({
      subtotal: 12080,
      discount: 1208,
      gst: 1957,
      total: 12829,
    });
  });
});

describe("formatMoney", () => {
  it("shows zero as ₹0.00", () => {
    expect(formatMoney(0)).toBe("₹0.00");
  });

  it("keeps two decimal places", () => {
    expect(formatMoney(4000)).toBe("₹40.00");
  });

  it("shows paise as rupees", () => {
    expect(formatMoney(21240)).toBe("₹212.40");
  });

  it("uses Indian digit grouping", () => {
    expect(formatMoney(12345678)).toBe("₹1,23,456.78");
  });
});
