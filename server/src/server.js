import { createApp } from "./app.js";
import { createStore } from "./store.js";

const port = Number(process.env.PORT ?? 3000);
// EMPTY_CATALOGUE=1 starts with no products, so automation tests only see data they seeded.
const store = createStore(process.env.EMPTY_CATALOGUE === "1" ? { products: [] } : {});
createApp(store, { adminKey: process.env.ADMIN_KEY }).listen(port, () => console.log(`Shop running at http://localhost:${port}`));
