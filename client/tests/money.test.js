import { describe, expect, it } from "vitest";
import { formatMoney } from "../src/money.js";

describe("formatMoney", () => {
  it.each([
    [0, "₹0.00"],
    [5, "₹0.05"],
    [21240, "₹212.40"],
    [-1200, "-₹12.00"],
    [12345678, "₹1,23,456.78"],
  ])("formats %s paise as %s", (paise, expected) => {
    expect(formatMoney(paise)).toBe(expected);
  });
});
