// Pure pricing rules. All money is in cents so totals never pick up float errors.

export const TAX_RATE = 0.1;

const DISCOUNTS = {
  SAVE10: { type: "percent", value: 10 },
  FLAT5: { type: "fixed", value: 500, minSubtotal: 2000 },
};

export function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      throw new Error(`Invalid quantity: ${item.qty}`);
    }
    if (!Number.isInteger(item.price) || item.price < 0) {
      throw new Error(`Invalid price: ${item.price}`);
    }
    return sum + item.price * item.qty;
  }, 0);
}

export function calculateDiscount(subtotal, code) {
  if (!code) return 0;
  const rule = DISCOUNTS[code.trim().toUpperCase()];
  if (!rule) throw new Error(`Unknown discount code: ${code}`);
  if (rule.minSubtotal && subtotal < rule.minSubtotal) return 0;
  const amount = rule.type === "percent" ? Math.round((subtotal * rule.value) / 100) : rule.value;
  return Math.min(amount, subtotal);
}

export function calculateTax(amount, rate = TAX_RATE) {
  return Math.round(amount * rate);
}

export function calculateTotal(items, code) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, code);
  const tax = calculateTax(subtotal - discount);
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}

export function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
