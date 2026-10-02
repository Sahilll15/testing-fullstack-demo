// Each browser tab keeps its own cart id, so two shoppers never share a cart.
function cartId() {
  let id = sessionStorage.getItem("cartId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("cartId", id);
  }
  return id;
}

async function request(method, path, body) {
  const res = await fetch(new URL(path, window.location.origin), {
    method,
    headers: { "Content-Type": "application/json", "X-Cart-Id": cartId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export const api = {
  getProducts: () => request("GET", "/api/products"),
  getCart: () => request("GET", "/api/cart"),
  addItem: (productId) => request("POST", "/api/cart/items", { productId, qty: 1 }),
  removeItem: (productId) => request("DELETE", `/api/cart/items/${productId}`),
  applyDiscount: (code) => request("POST", "/api/cart/discount", { code }),
  checkout: () => request("POST", "/api/checkout"),
};
