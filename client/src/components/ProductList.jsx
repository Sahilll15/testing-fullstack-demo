import { Plus } from "lucide-react";
import { formatMoney } from "../money.js";
import { artFor } from "../productArt.js";

export function ProductList({ products, onAdd, loading }) {
  if (loading) {
    return (
      <div className="product-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card product skeleton" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return <p className="muted">No products match your search.</p>;

  return (
    <ul className="product-grid">
      {products.map((p) => {
        const { Icon, tint, ink } = artFor(p.id);
        return (
          <li key={p.id} className="card product">
            <div className="product-art" style={{ background: tint, color: ink }}>
              <Icon size={56} strokeWidth={1.5} aria-hidden="true" />
              {p.category && <span className="chip">{p.category}</span>}
            </div>
            <div className="product-body">
              <h3>{p.name}</h3>
              {p.description && <p className="muted">{p.description}</p>}
              <div className="product-foot">
                <span className="price">{formatMoney(p.price)}</span>
                <button className="btn btn-primary btn-sm" aria-label={`Add ${p.name}`} onClick={() => onAdd(p.id)}>
                  <Plus size={16} aria-hidden="true" />
                  Add to cart
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
