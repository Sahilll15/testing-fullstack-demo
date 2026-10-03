import { GraduationCap, Search, ShoppingCart } from "lucide-react";

export function Header({ query, onQuery, count }) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <a className="brand" href="/">
          <span className="brand-mark">
            <GraduationCap size={18} aria-hidden="true" />
          </span>
          Campus Cart
        </a>
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <a className="cart-pill" href="#summary" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
          <ShoppingCart size={18} aria-hidden="true" />
          <span>Cart</span>
          <span className="badge">{count}</span>
        </a>
      </div>
    </header>
  );
}
