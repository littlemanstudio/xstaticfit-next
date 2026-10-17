This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment variables

See `.env.example` for the full list. Set them in Vercel under Project > Settings > Environment Variables.

| Name | Where | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | server / public | Stripe Checkout and the order webhook |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | server | Order and contact emails |
| `NEXT_PUBLIC_META_PIXEL_ID` | public (build time) | Meta Pixel id. Intended value `1748428746254894` ("Xstatic Fit Pixel"). Empty = all Meta tracking off |
| `META_CAPI_ACCESS_TOKEN` | server, secret | Meta Conversions API token (Events Manager > Settings > Conversions API) |
| `META_TEST_EVENT_CODE` | server, optional | Routes server events to Events Manager > Test events. Remove after testing |
| `META_CAPI_DEBUG` | server, optional | `1` logs each Conversions API payload (user data is hashed); `dry` logs it without sending |

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

## Meta Pixel and Conversions API

- Browser: `src/components/MetaPixel.tsx` loads `fbevents.js` with `next/script` only when `NEXT_PUBLIC_META_PIXEL_ID` is set and the visitor has not declined in the cookie banner (or sent Global Privacy Control). It fires `PageView` on every route change. `ViewContent` (product pages), `AddToCart` and `InitiateCheckout` (cart) and `Purchase` (success page) are fired from `src/lib/meta/pixel.ts`. Consent mode lives in `src/lib/meta/config.ts` (`opt-out` by default, `opt-in` available).
- Server: `src/lib/meta/capi.ts` sends the Conversions API copy. `ViewContent`, `AddToCart` and `InitiateCheckout` go through `POST /api/meta/event`; `Purchase` is sent from the Stripe webhook (`src/app/api/webhook/route.ts`) after the signature check.
- Deduplication: browser and server use the same `event_id`. For `Purchase` it is the Stripe Checkout Session id (`cs_...`).
- Failures never block checkout: Meta calls run after the response (`after()`), time out after 5 s, and only log errors.

### Testing events

1. In Events Manager open the Xstatic Fit Pixel > Test events and copy the test code.
2. Quick server check without the site:
   ```bash
   NEXT_PUBLIC_META_PIXEL_ID=1748428746254894 META_CAPI_ACCESS_TOKEN=... META_TEST_EVENT_CODE=TEST12345 \
     node scripts/meta-capi-test.mjs          # add --dry-run to only print the payload
   ```
   Or with curl:
   ```bash
   curl -s -X POST "https://graph.facebook.com/v25.0/1748428746254894/events?access_token=$META_CAPI_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"data":[{"event_name":"ViewContent","event_time":'"$(date +%s)"',"event_id":"curl-test-1","action_source":"website","event_source_url":"https://www.xstaticfit.com/product/xstatic-carbon-grips","user_data":{"client_ip_address":"203.0.113.10","client_user_agent":"curl-test"},"custom_data":{"currency":"USD","value":40,"content_ids":["xstatic-carbon-grips"],"content_type":"product"}}],"test_event_code":"'"$META_TEST_EVENT_CODE"'"}'
   ```
   A good response looks like `{"events_received":1,...}`.
3. Full flow on a preview deploy: set the three Meta env vars on the Preview environment, open the site, view a product, add to cart, start checkout. The Test events tab should show each event twice (Browser and Server) merged as deduplicated. With Stripe test keys you can also finish a test payment to see `Purchase`.
4. Remove `META_TEST_EVENT_CODE` before going live.

## Bundle discount and sales tax

- "Buy all three, save 10%" is applied by `src/lib/bundle.ts` (cart display) and `src/app/api/checkout/route.ts` (Stripe coupon `XSF_BUNDLE_ALL3_10`, created automatically on first use).
- Sales tax (PR IVU) is not collected. See the TODO in `src/lib/tax.ts`; an accountant must confirm before `COLLECT_SALES_TAX` is turned on.
