# Admin dashboard component sources (21st.dev)

- `src/components/ui/stats-card.tsx` + `card.tsx`: "Stats Card" by kavikatiyar, id 7841, https://21st.dev/@kavikatiyar/components/stats-card-1. Delivered code, header added, "use client" added.
- `src/components/ui/table.tsx` + `badge.tsx`: "Payments Table" by bundui, id 25160, https://21st.dev/@bundui/components/table1. Delivered code, header added.
- `src/components/ui/tabs-count-badge.tsx`: "Tabs with Count Badge" by coss.com, id 29425, https://21st.dev/@coss.com/components/tabs-count-badge. Retrieval quota was used up, so REVERSE ENGINEERED from the preview image (kept in `.21st-previews/`), restyled dark.
- Layout reference: the user's Shopify Orders and Inventory screenshots (nav, stat strip, tabs, table, pills).
- Tokens for these pieces are scoped to `.admin-shell` in `src/app/globals.css`.
- Local preview: `ADMIN_DEMO=1` + `ADMIN_PASSWORD` in `.env.development.local` (git-ignored, never set in production).

## Views and data (all real, nothing invented)
- Orders, Customers, Analytics: computed from paid Stripe Checkout sessions.
- Abandoned checkouts: Stripe sessions with status "expired".
- Inventory: counts you enter, stored in Upstash Redis / Vercel KV (env `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or `KV_REST_API_URL` + `KV_REST_API_TOKEN`). Committed = units in paid, unshipped orders. First shipment takes units out of On hand.
- Products: the catalog in `src/lib/products.ts`.
