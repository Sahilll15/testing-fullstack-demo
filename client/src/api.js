// Each browser tab keeps its own cart id, so two shoppers never share a cart.
function cartId() {
  let id = sessionStorage.getItem("cartId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("cartId", id);
  }
  return id;
}

async function request(baseUrl, method, path, body) {
  const res = await fetch(new URL(path, baseUrl), {
    method,
    headers: { "Content-Type": "application/json", "X-Cart-Id": cartId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

// The base URL is a parameter so contract tests can point the client at Pact's mock server.
export function createApi(baseUrl = window.location.origin) {
  return {
    getProducts: () => request(baseUrl, "GET", "/api/products"),
    getCart: () => request(baseUrl, "GET", "/api/cart"),
    addItem: (productId) => request(baseUrl, "POST", "/api/cart/items", { productId, qty: 1 }),
    removeItem: (productId) => request(baseUrl, "DELETE", `/api/cart/items/${productId}`),
    applyDiscount: (code) => request(baseUrl, "POST", "/api/cart/discount", { code }),
    checkout: () => request(baseUrl, "POST", "/api/checkout"),
  };
}

export const api = createApi();
