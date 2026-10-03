export function formatMoney(paise) {
  const sign = paise < 0 ? "-" : "";
  const rupees = (Math.abs(paise) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}₹${rupees}`;
}
