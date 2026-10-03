import { afterAll, beforeAll, describe, it } from "vitest";
import path from "node:path";
import { Verifier } from "@pact-foundation/pact";
import { createApp } from "../server/src/app.js";
import { createStore } from "../server/src/store.js";

// The Express API (provider) replays every request in the contract against the real server
// and checks each response still has the fields and types the React app depends on.
let server;
let baseUrl;

beforeAll(async () => {
  server = createApp(createStore()).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => server.close());

describe("contract: the API keeps its promises to the React app", () => {
  it("passes every interaction in the contract", async () => {
    await new Verifier({
      provider: "CampusCartAPI",
      providerBaseUrl: baseUrl,
      pactUrls: [path.resolve(import.meta.dirname, "pacts", "CampusCartWeb-CampusCartAPI.json")],
      logLevel: "warn",
    }).verifyProvider();
  }, 30000);
});
