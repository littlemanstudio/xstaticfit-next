/**
 * Minimal Klaviyo client (server only). Marketing flows live in Klaviyo, order and shipping
 * emails stay on Resend. Everything here is a no-op when KLAVIYO_PRIVATE_KEY is not set,
 * and never throws, so a Klaviyo outage cannot break signup, checkout or the Stripe webhook.
 */

const API = "https://a.klaviyo.com/api";
const REVISION = "2024-10-15";

export type Lang = "en" | "es";

export function klaviyoConfigured() {
  return Boolean(process.env.KLAVIYO_PRIVATE_KEY);
}

/** Puerto Rico shoppers get Spanish emails, everyone else English. */
export function languageFor(country?: string | null, browserLang?: string | null): Lang {
  if (country === "PR") return "es";
  if (country) return "en";
  return browserLang?.toLowerCase().startsWith("es") ? "es" : "en";
}

async function call(path: string, body: unknown) {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key) return { ok: false, detail: "KLAVIYO_PRIVATE_KEY not set" };
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        revision: REVISION,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = `Klaviyo ${res.status}: ${(await res.text()).slice(0, 300)}`;
      console.error(detail);
      return { ok: false, detail };
    }
    return { ok: true };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Klaviyo request failed:", detail);
    return { ok: false, detail };
  }
}

/**
 * Subscribes an email to the main list with marketing consent. Call only after the person
 * agreed (the signup form shows the consent line, or Stripe reported promotions opt_in).
 */
export async function subscribeEmail(opts: { email: string; language: Lang; source: string }) {
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!listId) return { ok: false, detail: "KLAVIYO_LIST_ID not set" };

  // The subscription endpoint does not accept custom properties, so save them on the profile first.
  const profile = await call("/profile-import/", {
    data: {
      type: "profile",
      attributes: {
        email: opts.email,
        properties: { language: opts.language, signup_source: opts.source },
      },
    },
  });
  if (!profile.ok) return profile;

  return call("/profile-subscription-bulk-create-jobs/", {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        profiles: {
          data: [
            {
              type: "profile",
              attributes: {
                email: opts.email,
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            },
          ],
        },
      },
      relationships: { list: { data: { type: "list", id: listId } } },
    },
  });
}

/** Records an event on a profile. `uniqueId` makes retries idempotent (Stripe resends webhooks). */
export async function trackEvent(opts: {
  email: string;
  metric: "Checkout Abandoned" | "Placed Order";
  language: Lang;
  properties: Record<string, unknown>;
  uniqueId: string;
  value?: number;
}) {
  return call("/events/", {
    data: {
      type: "event",
      attributes: {
        properties: opts.properties,
        unique_id: opts.uniqueId,
        ...(opts.value !== undefined ? { value: opts.value } : {}),
        metric: { data: { type: "metric", attributes: { name: opts.metric } } },
        profile: {
          data: {
            type: "profile",
            attributes: { email: opts.email, properties: { language: opts.language } },
          },
        },
      },
    },
  });
}
