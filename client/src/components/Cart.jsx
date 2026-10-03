import { PackageOpen, Trash2 } from "lucide-react";
import { formatMoney } from "../money.js";
import { artFor } from "../productArt.js";

export function Cart({ cart, onRemove }) {
  if (cart.items.length === 0) {
    return (
      <div className="empty">
        <PackageOpen size={36} strokeWidth={1.5} aria-hidden="true" />
        <p>Your cart is empty.</p>
        <span className="muted">Add something from the shop to get started.</span>
      </div>
    );
  }

  return (
    <>
      <ul className="lines" aria-label="Cart items">
        {cart.items.map((item) => {
          const { Icon, tint, ink } = artFor(item.productId);
          return (
            <li key={item.productId} className="line">
              <span className="thumb" style={{ background: tint, color: ink }}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="line-info">
                <span className="line-name">
                  {item.name} <span className="qty">× {item.qty}</span>
                </span>
                <span className="muted">{formatMoney(item.price)} each</span>
              </span>
              <span className="line-price">{formatMoney(item.price * item.qty)}</span>
              <button className="icon-btn" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.productId)}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      <dl className="totals" aria-label="Totals">
        <dt>Subtotal</dt>
        <dd data-testid="subtotal">{formatMoney(cart.subtotal)}</dd>
        <dt>Discount</dt>
        <dd data-testid="discount" className={cart.discount ? "saving" : undefined}>
          {formatMoney(-cart.discount)}
        </dd>
        <dt>GST (18%)</dt>
        <dd data-testid="gst">{formatMoney(cart.gst)}</dd>
        <dt className="grand">Total</dt>
        <dd className="grand" data-testid="total">
          {formatMoney(cart.total)}
        </dd>
      </dl>
    </>
  );
}
