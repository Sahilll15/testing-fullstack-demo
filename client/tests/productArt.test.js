import { describe, expect, it } from "vitest";
import { artFor } from "../src/productArt.js";

describe("artFor", () => {
  it.each(["chai", "samosa", "notebook", "bottle", "tote", "earphones"])("has an icon and colours for %s", (id) => {
    const art = artFor(id);
    expect(art.Icon).toBeTruthy();
    expect(art.tint).toMatch(/^#[0-9a-f]{6}$/);
    expect(art.ink).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("falls back to a plain package for unknown products", () => {
    expect(artFor("laptop").tint).toBe("#eef0f3");
  });
});
