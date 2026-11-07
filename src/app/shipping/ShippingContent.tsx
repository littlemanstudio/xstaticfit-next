"use client";

import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import { useLang } from "@/lib/lang";

const MAIL = "contact@xstaticfit.com";

// Same policy in both languages. The shipping cost is already in the price; a return refunds the
// goods, not the original shipping, and the buyer pays the way back.
const COPY = {
  en: {
    eyebrow: "Shipping to the US, Puerto Rico & Canada",
    title: "Shipping & Returns",
    tagline: "Delivering rock solid dependability",
    shipTitle: "Shipping",
    ship: [
      "We currently ship to the United States, Puerto Rico and Canada. Shipping is included in the price of your order.",
      "We typically ship within 24 hours of placing your order; however, some orders may take up to 48 hours to process. We do not ship on Saturdays or Sundays.",
      "All orders arrive within 3 to 5 business days.",
    ],
    contactLead: "For more information and shipping inquiries, contact us at",
    returnsTitle: "Returns",
    returns: [
      "Change of heart? No problem. We accept exchanges or refunds within 14 days after delivery.",
      "Send the item back unused, in its original condition and packaging. Damage caused during the return is the customer’s responsibility.",
      "Once we receive and inspect it, we refund the item price. The original shipping cost is not refunded, and return shipping is paid by the customer. Items that were altered or damaged after delivery cannot be returned.",
      "The parcel is your responsibility until it reaches us, so we recommend a traceable delivery service.",
    ],
    returnsLead: "To set up your return, email",
    shop: "Shop Now",
  },
  es: {
    eyebrow: "Envíos a EE. UU., Puerto Rico y Canadá",
    title: "Envíos y devoluciones",
    tagline: "Equipo que no te falla",
    shipTitle: "Envíos",
    ship: [
      "Por ahora enviamos a Estados Unidos, Puerto Rico y Canadá. El envío está incluido en el precio de tu pedido.",
      "Normalmente enviamos dentro de 24 horas de tu compra; algunos pedidos pueden tardar hasta 48 horas en prepararse. No enviamos sábados ni domingos.",
      "Todos los pedidos llegan en 3 a 5 días hábiles.",
    ],
    contactLead: "Para más información o dudas sobre tu envío, escríbenos a",
    returnsTitle: "Devoluciones",
    returns: [
      "¿Cambiaste de opinión? Sin problema. Aceptamos cambios o reembolsos dentro de los 14 días después de la entrega.",
      "Devuelve el artículo sin usar, en su condición y empaque originales. Cualquier daño durante la devolución es responsabilidad del cliente.",
      "Cuando lo recibamos y lo revisemos, te reembolsamos el precio del artículo. El costo del envío original no se reembolsa y el envío de la devolución lo paga el cliente. No se aceptan devoluciones de artículos modificados o dañados después de la entrega.",
      "El paquete es tu responsabilidad hasta que nos llegue, por eso te recomendamos un servicio de envío con rastreo.",
    ],
    returnsLead: "Para coordinar tu devolución, escríbenos a",
    shop: "Comprar ahora",
  },
} as const;

export default function ShippingContent() {
  const t = COPY[useLang()];
  return (
    <div className="bg-ink text-white">
      <Reveal className="py-14 text-center md:py-24">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">{t.title}</h1>
        <p className="mt-2 text-sm text-white/60">{t.tagline}</p>
      </Reveal>

      <Reveal className="mx-auto max-w-3xl border-t border-white/10 px-6 py-12 md:px-10 md:py-20">
        <div className="flex flex-col gap-4">
          <h2 className="font-stencil text-2xl uppercase">{t.shipTitle}</h2>
          {t.ship.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-white/70">
              {p}
            </p>
          ))}
          <p className="text-sm leading-relaxed text-white/70">
            {t.contactLead}{" "}
            <a href={`mailto:${MAIL}`} className="underline">
              {MAIL}
            </a>
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-4">
          <h2 className="font-stencil text-2xl uppercase">{t.returnsTitle}</h2>
          {t.returns.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-white/70">
              {p}
            </p>
          ))}
          <p className="text-sm leading-relaxed text-white/70">
            {t.returnsLead}{" "}
            <a href={`mailto:${MAIL}`} className="underline">
              {MAIL}
            </a>
          </p>
        </div>

        <Link
          href="/shop"
          className="mt-14 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
        >
          {t.shop}
        </Link>
      </Reveal>
    </div>
  );
}
