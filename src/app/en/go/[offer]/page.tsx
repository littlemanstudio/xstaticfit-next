import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferPage from "@/components/funnel/OfferPage";
import { OFFER_IDS, getOffer } from "@/lib/funnel";

export const dynamicParams = false;

export function generateStaticParams() {
  return OFFER_IDS.map((offer) => ({ offer }));
}

export async function generateMetadata(props: PageProps<"/en/go/[offer]">): Promise<Metadata> {
  const { offer } = await props.params;
  const o = getOffer(offer);
  if (!o) return {};
  const c = o.copy.en;
  return {
    title: { absolute: c.metaTitle },
    description: c.sub,
    robots: { index: false, follow: false },
    alternates: { canonical: `/en/go/${o.id}` },
    openGraph: { title: c.metaTitle, description: c.sub, images: [{ url: o.gallery[0].src }] },
  };
}

export default async function GoPageEn(props: PageProps<"/en/go/[offer]">) {
  const { offer } = await props.params;
  const o = getOffer(offer);
  if (!o) notFound();
  return <OfferPage offerId={o.id} lang="en" />;
}
