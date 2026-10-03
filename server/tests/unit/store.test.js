import { beforeEach, describe, expect, it } from "vitest";
import { PRODUCTS, createStore } from "../../src/store.js";

let store;
beforeEach(() => {
  store = createStore();
});

describe("PRODUCTS", () => {
  it("has unique ids", () => {
    const ids = PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stores every price as whole paise above zero", () => {
    for (const p of PRODUCTS) {
      expect(Number.isInteger(p.price)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
    }
  });
});

describe("getCart", () => {
  it("creates an empty cart the first time", () => {
    expect(store.getCart("asha")).toEqual({ items: [], code: null });
  });

  it("returns the same cart on later calls", () => {
    store.addItem("asha", "chai", 1);
    expect(store.getCart("asha").items).toHaveLength(1);
  });
});

describe("addItem", () => {
  it("adds a new line for a new product", () => {
    store.addItem("asha", "chai", 2);
    expect(store.getCart("asha").items).toEqual([{ productId: "chai", qty: 2 }]);
  });

  it("adds to the quantity when the product is already in the cart", () => {
    store.addItem("asha", "chai", 2);
    store.addItem("asha", "chai", 3);
    expect(store.getCart("asha").items).toEqual([{ productId: "chai", qty: 5 }]);
  });

  it("keeps different products on separate lines, in the order added", () => {
    store.addItem("asha", "samosa", 1);
    store.addItem("asha", "chai", 1);
    expect(store.getCart("asha").items.map((i) => i.productId)).toEqual(["samosa", "chai"]);
  });
});

describe("removeItem", () => {
  it("removes only the chosen product", () => {
    store.addItem("asha", "chai", 1);
    store.addItem("asha", "samosa", 1);
    store.removeItem("asha", "chai");
    expect(store.getCart("asha").items).toEqual([{ productId: "samosa", qty: 1 }]);
  });

  it("does nothing if the product is not in the cart", () => {
    store.addItem("asha", "chai", 1);
    store.removeItem("asha", "bottle");
    expect(store.getCart("asha").items).toHaveLength(1);
  });
});

describe("setCode", () => {
  it("saves the discount code on the cart", () => {
    store.setCode("asha", "FEST10");
    expect(store.getCart("asha").code).toBe("FEST10");
  });
});

describe("placeOrder", () => {
  it("gives order numbers in sequence", () => {
    expect(store.placeOrder("asha")).toBe("ORD-0001");
    expect(store.placeOrder("ravi")).toBe("ORD-0002");
  });

  it("empties the cart after the order", () => {
    store.addItem("asha", "chai", 1);
    store.setCode("asha", "FEST10");
    store.placeOrder("asha");
    expect(store.getCart("asha")).toEqual({ items: [], code: null });
  });
});

describe("separate carts", () => {
  it("never mixes two shoppers' items", () => {
    store.addItem("asha", "chai", 1);
    store.addItem("ravi", "notebook", 2);
    expect(store.getCart("asha").items).toEqual([{ productId: "chai", qty: 1 }]);
    expect(store.getCart("ravi").items).toEqual([{ productId: "notebook", qty: 2 }]);
  });

  it("gives each new store its own data", () => {
    store.addItem("asha", "chai", 1);
    expect(createStore().getCart("asha").items).toHaveLength(0);
  });
});
