// Pure pricing rules. All money is in paise so totals never pick up float errors.

export const GST_RATE = 0.18;

const DISCOUNTS = {
  FEST10: { type: "percent", value: 10 },
  FLAT50: { type: "fixed", value: 5000, minSubtotal: 50000 },
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

export function calculateGst(amount, rate = GST_RATE) {
  return Math.round(amount * rate);
}

export function calculateTotal(items, code) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, code);
  const gst = calculateGst(subtotal - discount);
  return { subtotal, discount, gst, total: subtotal - discount + gst };
}

export function formatMoney(paise) {
  const rupees = (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `₹${rupees}`;
}
