import { PRODUCTS } from "./products";
import type { Lang } from "./lang";

// Ad landing pages (/go/<offer> in Spanish, /en/go/<offer> in English).
// Every claim here already exists on the store (product pages, /shipping, FAQ) or was
// confirmed by the owner (see xstaticfit-reels/ADS_BATCH1_SHOTLIST.md). Nothing is invented:
// no reviews, no countdowns, no "limited stock", no struck-through former prices.

/**
 * Checkout charges $0 shipping today (no shipping_options in /api/checkout), so the pages say
 * shipping is included. OWNER: if shipping fees are ever added, set this to false.
 */
export const SHIPPING_INCLUDED = true;

export type OfferId = "kit" | "grips" | "bar";
export const OFFER_IDS: OfferId[] = ["kit", "grips", "bar"];

const BAR = "xstatic-door-pull-up-bar";
const GRIPS = "xstatic-carbon-grips";
const ROPE = "xstatic-weighted-jump-ropes";

type OfferCopy = {
  metaTitle: string;
  eyebrow: string;
  h1: string;
  sub: string;
  bullets: string[];
  includedTitle: string;
};

export type Offer = {
  id: OfferId;
  /** Slugs ticked when the page opens. */
  preselected: string[];
  /** Order of the product rows in the buy box (hero product first). */
  order: string[];
  gallery: { src: string; alt: Record<Lang, string> }[];
  copy: Record<Lang, OfferCopy>;
};

export const OFFERS: Record<OfferId, Offer> = {
  kit: {
    id: "kit",
    preselected: [BAR, GRIPS, ROPE],
    order: [BAR, GRIPS, ROPE],
    gallery: [
      { src: "/images/pullupbar/3.jpg", alt: { es: "Barra de pull-ups para puerta Xstatic Fit", en: "Xstatic Fit door pull-up bar" } },
      { src: "/images/grips/8.jpg", alt: { es: "Grips fibra de carbono Xstatic Fit", en: "Xstatic Fit carbon fiber grips" } },
      { src: "/images/ropes/5.jpg", alt: { es: "Cuerda con pesas Xstatic Fit", en: "Xstatic Fit weighted jump rope" } },
      { src: "/images/hero.jpg", alt: { es: "Atleta de Xstatic Fit entrenando", en: "Xstatic Fit athlete training" } },
    ],
    copy: {
      es: {
        metaTitle: "Warrior Kit: tu gym en casa | Xstatic Fit",
        eyebrow: "Warrior Kit",
        h1: "Tu gym entero, en un kit",
        sub: "Barra para la puerta sin tornillos, grips fibra de carbono y cuerda con pesas. Si llevas los tres, ahorras 10%.",
        bullets: [
          "Entrena en casa, sin membresía y sin taladro",
          "Los tres productos juntos, listos para usar",
          "10% de descuento al llevar barra, grips y cuerda",
        ],
        includedTitle: "Lo que trae el kit",
      },
      en: {
        metaTitle: "Warrior Kit: your home gym | Xstatic Fit",
        eyebrow: "Warrior Kit",
        h1: "Your whole gym, in one kit",
        sub: "A no-screw door bar, carbon fiber grips and a weighted rope. Take all three and save 10%.",
        bullets: [
          "Train at home, no membership and no drilling",
          "All three pieces together, ready to use",
          "10% off when you take the bar, grips and rope",
        ],
        includedTitle: "What comes in the kit",
      },
    },
  },
  grips: {
    id: "grips",
    preselected: [GRIPS],
    order: [GRIPS, BAR, ROPE],
    gallery: [
      { src: "/images/grips/8.jpg", alt: { es: "Grips fibra de carbono Xstatic Fit", en: "Xstatic Fit carbon fiber grips" } },
      { src: "/images/hero.jpg", alt: { es: "Atleta de Xstatic Fit entrenando", en: "Xstatic Fit athlete training" } },
    ],
    copy: {
      es: {
        metaTitle: "Grips fibra de carbono | Xstatic Fit",
        eyebrow: "Grips fibra de carbono",
        h1: "Para de resbalarte de la barra",
        sub: "Grips fibra de carbono que protegen tus manos y te dan control en cada pull-up y levantamiento.",
        bullets: [
          "Fibra de carbono resistente, hecha para durar",
          "Protegen tus manos en pull-ups y levantamientos",
          "Sin resbalar y sin romperse, rep tras rep",
        ],
        includedTitle: "Completa tu entrenamiento",
      },
      en: {
        metaTitle: "Carbon fiber grips | Xstatic Fit",
        eyebrow: "Carbon fiber grips",
        h1: "Stop slipping off the bar",
        sub: "Carbon fiber grips that protect your hands and give you control on every pull-up and lift.",
        bullets: [
          "Durable carbon fiber, built to last",
          "Protect your hands on pull-ups and lifts",
          "No slips, no rips, rep after rep",
        ],
        includedTitle: "Complete your training",
      },
    },
  },
  bar: {
    id: "bar",
    preselected: [BAR],
    order: [BAR, GRIPS, ROPE],
    gallery: [
      { src: "/images/pullupbar/3.jpg", alt: { es: "Barra de pull-ups para puerta Xstatic Fit", en: "Xstatic Fit door pull-up bar" } },
      { src: "/images/hero.jpg", alt: { es: "Atleta de Xstatic Fit entrenando", en: "Xstatic Fit athlete training" } },
    ],
    copy: {
      es: {
        metaTitle: "Barra de pull-ups para puerta | Xstatic Fit",
        eyebrow: "Barra de pull-ups para puerta",
        h1: "Una puerta. Un gym.",
        sub: "Se ajusta al marco de tu puerta sin tornillos ni taladro. Mide tu marco: sirve de 72 a 110 cm.",
        bullets: [
          "Sin tornillos y sin daños a la puerta",
          "Ajustable para marcos de 72 a 110 cm",
          "Capacidad de 330 libras, según el fabricante",
        ],
        includedTitle: "Súmale al entrenamiento",
      },
      en: {
        metaTitle: "Door pull-up bar | Xstatic Fit",
        eyebrow: "Door pull-up bar",
        h1: "One door. One gym.",
        sub: "Fits your door frame with no screws and no drilling. Measure your frame: it fits 72 to 110 cm.",
        bullets: [
          "No screws and no damage to the door",
          "Adjustable for frames from 72 to 110 cm",
          "Rated by the manufacturer up to 330 lbs",
        ],
        includedTitle: "Add to your training",
      },
    },
  },
};

export function getOffer(id: string): Offer | undefined {
  return OFFER_IDS.includes(id as OfferId) ? OFFERS[id as OfferId] : undefined;
}

/** Display names and one-line descriptions per product, per language. */
export const PRODUCT_COPY: Record<string, Record<Lang, { name: string; line: string }>> = {
  [BAR]: {
    es: { name: "Barra de pull-ups para puerta", line: "Ajustable de 72 a 110 cm, sin tornillos" },
    en: { name: "Door pull-up bar", line: "Adjustable 72 to 110 cm, no screws" },
  },
  [GRIPS]: {
    es: { name: "Grips fibra de carbono", line: "Protegen tus manos y dan control" },
    en: { name: "Carbon fiber grips", line: "Protect your hands, give you control" },
  },
  [ROPE]: {
    es: { name: "Cuerda con pesas", line: "Largo ajustable, pesas incluidas" },
    en: { name: "Weighted jump rope", line: "Adjustable length, weights included" },
  },
};

export function productsFor(slugs: string[]) {
  return slugs.map((s) => PRODUCTS.find((p) => p.slug === s)).filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));
}

type Faq = { q: string; a: string };

export const UI: Record<
  Lang,
  {
    buy: string;
    buying: string;
    pickTitle: string;
    bundleHint: (missing: number) => string;
    bundleDone: string;
    subtotal: string;
    bundleLine: string;
    total: string;
    mustKeepOne: string;
    trust: string[];
    stepsTitle: string;
    steps: { t: string; d: string }[];
    benefitsTitle: string;
    faqTitle: string;
    faq: Faq[];
    finalTitle: string;
    finalSub: string;
    secure: string;
    footer: { label: string; href: string }[];
    homeAria: string;
    cartAria: string;
  }
> = {
  es: {
    buy: "Comprar ahora",
    buying: "Abriendo el pago…",
    pickTitle: "Tu pedido",
    bundleHint: (m) => (m === 1 ? "Agrega 1 producto más y ahorra 10%" : `Agrega ${m} productos más y ahorra 10%`),
    bundleDone: "Descuento del 10% aplicado por llevar los tres",
    subtotal: "Subtotal",
    bundleLine: "Descuento del kit (10%)",
    total: "Total",
    mustKeepOne: "Deja al menos un producto seleccionado.",
    trust: [
      SHIPPING_INCLUDED ? "Envío incluido" : "Envío a Puerto Rico, EE. UU. y Canadá",
      "Sale en 24 a 48 horas",
      "14 días para devolver",
      "Pago seguro con Stripe",
    ],
    stepsTitle: "Así de fácil",
    steps: [
      { t: "Compras en 1 minuto", d: "Escoges tu pedido y pagas en la pantalla segura de Stripe." },
      { t: "Sale en 24 a 48 horas", d: "Te escribimos por email cuando salga. No enviamos sábados ni domingos." },
      { t: "Llega en 3 a 5 días hábiles", d: "A Puerto Rico, Estados Unidos y Canadá." },
    ],
    benefitsTitle: "Por qué Xstatic Fit",
    faqTitle: "Preguntas rápidas",
    faq: [
      {
        q: "¿Cuánto tarda en llegar?",
        a: "Enviamos en 24 a 48 horas y el pedido llega en 3 a 5 días hábiles. No enviamos sábados ni domingos.",
      },
      {
        q: "¿Puedo devolverlo?",
        a: "Sí. Aceptamos cambios o reembolsos dentro de 14 días después de la entrega, con el producto en condición de venta y su empaque. El envío original no se reembolsa.",
      },
      {
        q: "¿La barra daña la puerta?",
        a: "Se ajusta al marco sin tornillos ni taladro. Sirve para marcos de 72 a 110 cm de ancho, así que mide el tuyo antes de comprar.",
      },
      { q: "¿Cuánto peso aguanta la barra?", a: "El fabricante la califica hasta 330 libras." },
      { q: "¿A dónde envían?", a: "A Puerto Rico, Estados Unidos y Canadá." },
      {
        q: "¿Es seguro pagar?",
        a: "El pago se hace en Stripe. Nosotros no vemos ni guardamos los datos de tu tarjeta.",
      },
    ],
    finalTitle: "Empieza a entrenar esta semana",
    finalSub: "Pides hoy, sale en 24 a 48 horas y llega en 3 a 5 días hábiles.",
    secure: "Pago seguro con Stripe",
    footer: [
      { label: "Envíos y devoluciones", href: "/shipping" },
      { label: "Privacidad", href: "/privacy" },
      { label: "Términos", href: "/terms" },
      { label: "Contacto", href: "/contact" },
    ],
    homeAria: "Xstatic Fit",
    cartAria: "Abrir el carrito",
  },
  en: {
    buy: "Buy now",
    buying: "Opening checkout…",
    pickTitle: "Your order",
    bundleHint: (m) => (m === 1 ? "Add 1 more item and save 10%" : `Add ${m} more items and save 10%`),
    bundleDone: "10% discount applied for taking all three",
    subtotal: "Subtotal",
    bundleLine: "Kit discount (10%)",
    total: "Total",
    mustKeepOne: "Keep at least one item selected.",
    trust: [
      SHIPPING_INCLUDED ? "Shipping included" : "Ships to PR, the US and Canada",
      "Ships in 24 to 48 hours",
      "14-day returns",
      "Secure checkout with Stripe",
    ],
    stepsTitle: "How it works",
    steps: [
      { t: "Order in 1 minute", d: "Pick your order and pay on Stripe's secure screen." },
      { t: "Ships in 24 to 48 hours", d: "We email you when it ships. We do not ship on weekends." },
      { t: "Arrives in 3 to 5 business days", d: "To Puerto Rico, the United States and Canada." },
    ],
    benefitsTitle: "Why Xstatic Fit",
    faqTitle: "Quick questions",
    faq: [
      {
        q: "How long does delivery take?",
        a: "We ship within 24 to 48 hours and orders arrive in 3 to 5 business days. We do not ship on Saturdays or Sundays.",
      },
      {
        q: "Can I return it?",
        a: "Yes. We accept exchanges or refunds within 14 days after delivery, with the item in sellable condition and its packaging. The original delivery charge is not refunded.",
      },
      {
        q: "Will the bar damage my door?",
        a: "It adjusts to the frame with no screws and no drilling. It fits frames 72 to 110 cm wide, so measure yours before you order.",
      },
      { q: "How much weight does the bar hold?", a: "The manufacturer rates it up to 330 lbs." },
      { q: "Where do you ship?", a: "To Puerto Rico, the United States and Canada." },
      {
        q: "Is it safe to pay?",
        a: "Payment happens on Stripe. We never see or store your card details.",
      },
    ],
    finalTitle: "Start training this week",
    finalSub: "Order today, it ships in 24 to 48 hours and arrives in 3 to 5 business days.",
    secure: "Secure checkout with Stripe",
    footer: [
      { label: "Shipping & returns", href: "/shipping" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
    homeAria: "Xstatic Fit",
    cartAria: "Open cart",
  },
};
