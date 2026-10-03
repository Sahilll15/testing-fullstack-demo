// The server is started with this key (see playwright.config.js), and tests send it to the admin API.
export const ADMIN_KEY = process.env.ADMIN_KEY ?? "local-test-admin-key";
