import { formatMoney } from "../money.js";

export function ProductList({ products, onAdd }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <span>
            {p.name} <small>{formatMoney(p.price)}</small>
          </span>
          <button onClick={() => onAdd(p.id)}>Add {p.name}</button>
        </li>
      ))}
    </ul>
  );
}
