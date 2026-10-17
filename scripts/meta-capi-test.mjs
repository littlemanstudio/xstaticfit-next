#!/usr/bin/env node
// Sends ONE test Purchase event to the Meta Conversions API so it shows up in
// Events Manager > Xstatic Fit Pixel > Test events. It refuses to run without
// META_TEST_EVENT_CODE so it can never create a fake real purchase.
//
// Usage (from the repo root):
//   NEXT_PUBLIC_META_PIXEL_ID=1748428746254894 \
//   META_CAPI_ACCESS_TOKEN=... META_TEST_EVENT_CODE=TEST12345 \
//   node scripts/meta-capi-test.mjs            # send
//   node scripts/meta-capi-test.mjs --dry-run  # print the payload only, no network
//
// Endpoint and payload format: https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api
import { createHash, randomUUID } from "node:crypto";

const GRAPH_API_VERSION = "v25.0"; // keep in sync with src/lib/meta/capi.ts
const pixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();
const token = process.env.META_CAPI_ACCESS_TOKEN ?? "";
const testCode = (process.env.META_TEST_EVENT_CODE ?? "").trim();
const dryRun = process.argv.includes("--dry-run");

if (!/^\d{5,20}$/.test(pixelId)) {
  console.error("Set NEXT_PUBLIC_META_PIXEL_ID");
  process.exit(1);
}
if (!testCode) {
  console.error("Set META_TEST_EVENT_CODE (Events Manager > Test events). Refusing to send a real event.");
  process.exit(1);
}

const sha = (v) => createHash("sha256").update(v, "utf8").digest("hex");
const eventId = `cs_test_script_${randomUUID()}`;

const body = {
  data: [
    {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: "https://www.xstaticfit.com/checkout/success",
      user_data: {
        em: sha("test@example.com"),
        ph: sha("17875550100"),
        country: sha("pr"),
        client_ip_address: "203.0.113.10",
        client_user_agent: "Mozilla/5.0 (meta-capi-test script)",
      },
      custom_data: {
        currency: "USD",
        value: 112.5,
        content_type: "product",
        content_ids: ["xstatic-carbon-grips", "xstatic-weighted-jump-ropes", "xstatic-door-pull-up-bar"],
        num_items: 3,
        order_id: eventId,
      },
    },
  ],
  test_event_code: testCode,
};

console.log(JSON.stringify(body, null, 2));
if (dryRun) process.exit(0);
if (!token) {
  console.error("Set META_CAPI_ACCESS_TOKEN to send.");
  process.exit(1);
}

const res = await fetch(
  `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
);
console.log(res.status, await res.text());
process.exit(res.ok ? 0 : 1);
