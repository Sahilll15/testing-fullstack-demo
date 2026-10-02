import { describe, expect, it } from "vitest";
import { formatMoney } from "../src/money.js";

describe("formatMoney", () => {
  it.each([
    [0, "$0.00"],
    [5, "$0.05"],
    [2079, "$20.79"],
    [-120, "-$1.20"],
  ])("formats %s cents as %s", (cents, expected) => {
    expect(formatMoney(cents)).toBe(expected);
  });
});
