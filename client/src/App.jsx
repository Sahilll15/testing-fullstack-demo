import { useEffect, useState } from "react";
import { api } from "./api.js";
import { formatMoney } from "./money.js";
import { ProductList } from "./components/ProductList.jsx";
import { Cart } from "./components/Cart.jsx";
import { DiscountForm } from "./components/DiscountForm.jsx";

const EMPTY_CART = { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 };

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(EMPTY_CART);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

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
      setProducts(await api.getProducts());
      setCart(await api.getCart());
    });
  }, []);

  const update = (action) => run(async () => setCart(await action()));

  const checkout = () =>
    run(async () => {
      setOrder(await api.checkout());
      setCart(await api.getCart());
    });

  return (
    <main>
      <h1>Tiny Shop</h1>
      <p>A small React + Express app for practising unit, API and browser tests.</p>
      <div className="grid">
        <section aria-labelledby="products-h">
          <h2 id="products-h">Products</h2>
          <ProductList products={products} onAdd={(id) => update(() => api.addItem(id))} />
        </section>
        <section aria-labelledby="cart-h">
          <h2 id="cart-h">Your cart</h2>
          <Cart cart={cart} onRemove={(id) => update(() => api.removeItem(id))} />
          <DiscountForm onApply={(code) => update(() => api.applyDiscount(code))} />
          <p role="alert">{error}</p>
          <button onClick={checkout}>Checkout</button>
          <p role="status">{order && `Order placed: ${order.orderId} (${formatMoney(order.total)})`}</p>
        </section>
      </div>
    </main>
  );
}
