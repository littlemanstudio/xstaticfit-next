import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferPage from "@/components/funnel/OfferPage";
import { OFFER_IDS, getOffer } from "@/lib/funnel";

export const dynamicParams = false;

export function generateStaticParams() {
  return OFFER_IDS.map((offer) => ({ offer }));
}

export async function generateMetadata(props: PageProps<"/go/[offer]">): Promise<Metadata> {
  const { offer } = await props.params;
  const o = getOffer(offer);
  if (!o) return {};
  const c = o.copy.es;
  return {
    title: { absolute: c.metaTitle },
    description: c.sub,
    // Ad landing page: keep it out of search results, it only exists for paid traffic.
    robots: { index: false, follow: false },
    alternates: { canonical: `/go/${o.id}` },
    openGraph: { title: c.metaTitle, description: c.sub, images: [{ url: o.gallery[0].src }] },
  };
}

export default async function GoPage(props: PageProps<"/go/[offer]">) {
  const { offer } = await props.params;
  const o = getOffer(offer);
  if (!o) notFound();
  return <OfferPage offerId={o.id} lang="es" />;
}
