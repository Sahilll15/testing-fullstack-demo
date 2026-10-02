import { formatMoney } from "../money.js";

export function Cart({ cart, onRemove }) {
  if (cart.items.length === 0) return <p>Your cart is empty.</p>;

  return (
    <>
      <ul aria-label="Cart items">
        {cart.items.map((item) => (
          <li key={item.productId}>
            <span>
              {item.name} × {item.qty}
            </span>
            <button className="link" onClick={() => onRemove(item.productId)}>
              Remove {item.name}
            </button>
          </li>
        ))}
      </ul>
      <dl aria-label="Totals">
        <dt>Subtotal</dt>
        <dd data-testid="subtotal">{formatMoney(cart.subtotal)}</dd>
        <dt>Discount</dt>
        <dd data-testid="discount">{formatMoney(-cart.discount)}</dd>
        <dt>Tax</dt>
        <dd data-testid="tax">{formatMoney(cart.tax)}</dd>
        <dt className="total">Total</dt>
        <dd className="total" data-testid="total">
          {formatMoney(cart.total)}
        </dd>
      </dl>
    </>
  );
}
