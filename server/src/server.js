import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
createApp(undefined, { adminKey: process.env.ADMIN_KEY }).listen(port, () => console.log(`Shop running at http://localhost:${port}`));
