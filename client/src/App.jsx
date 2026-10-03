import { useEffect, useMemo, useState } from "react";
import { CircleCheck, RotateCcw, Smartphone, TriangleAlert, Truck } from "lucide-react";
import { api } from "./api.js";
import { formatMoney } from "./money.js";
import { Header } from "./components/Header.jsx";
import { ProductList } from "./components/ProductList.jsx";
import { Cart } from "./components/Cart.jsx";
import { DiscountForm } from "./components/DiscountForm.jsx";

const EMPTY_CART = { items: [], code: null, subtotal: 0, discount: 0, gst: 0, total: 0 };

const PERKS = [
  { Icon: Truck, title: "Free delivery", text: "To your hostel on orders above ₹499" },
  { Icon: Smartphone, title: "Pay with UPI", text: "GPay, PhonePe, Paytm or card" },
  { Icon: RotateCcw, title: "Easy returns", text: "7-day return window" },
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(EMPTY_CART);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [query, setQuery] = useState("");

  async function run(action) {
    setError("");
    try {
      return await action();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    run(async () => {
      try {
        setProducts(await api.getProducts());
        setCart(await api.getCart());
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const update = (action) =>
    run(async () => {
      setOrder(null);
      setCart(await action());
    });

  const checkout = () =>
    run(async () => {
      setOrder(await api.checkout());
      setCart(await api.getCart());
    });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name} ${p.category ?? ""} ${p.description ?? ""}`.toLowerCase().includes(q));
  }, [products, query]);

  const count = cart.items.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <Header query={query} onQuery={setQuery} count={count} />

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">Fest season sale</p>
            <h1>Everything you need on campus.</h1>
            <p className="hero-text">Chai, snacks, stationery and gadgets, delivered to your hostel gate.</p>
          </div>
          <div className="promo">
            <span className="promo-label">Limited offer</span>
            <strong>10% off for students</strong>
            <span>
              Use code <code>FEST10</code> at checkout
            </span>
          </div>
        </section>

        <ul className="perks">
          {PERKS.map(({ Icon, title, text }) => (
            <li key={title}>
              <span className="perk-icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>
                <strong>{title}</strong>
                <span className="muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="layout">
          <section aria-labelledby="products-h">
            <div className="section-head">
              <h2 id="products-h">Products</h2>
              {!loading && <span className="muted">{visible.length} items</span>}
            </div>
            <ProductList products={visible} loading={loading} onAdd={(id) => update(() => api.addItem(id))} />
          </section>

          <aside id="summary" className="card summary" aria-labelledby="cart-h">
            <h2 id="cart-h">Your cart</h2>
            <Cart cart={cart} onRemove={(id) => update(() => api.removeItem(id))} />
            <DiscountForm applied={cart.code} onApply={(code) => update(() => api.applyDiscount(code))} />
            <p role="alert" className="alert">
              {error && <TriangleAlert size={16} aria-hidden="true" />}
              {error}
            </p>
            <button className="btn btn-primary btn-block" onClick={checkout}>
              Checkout
            </button>
            <div role="status" className={order ? "success" : undefined}>
              {order && (
                <>
                  <CircleCheck size={20} aria-hidden="true" />
                  <span>
                    Order placed: {order.orderId} ({formatMoney(order.total)})
                  </span>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="footer">
        <div className="container">Campus Cart is a demo app for practising unit, API and browser tests.</div>
      </footer>
    </>
  );
}
