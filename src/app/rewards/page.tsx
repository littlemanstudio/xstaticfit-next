import type { Metadata } from "next";
import RewardsContent from "./RewardsContent";

export const metadata: Metadata = {
  title: "Get 10% Off Your Next Order",
  description: "Send us a video of you using your Xstatic Fit gear and your honest review, and get 10% off any item on your next order.",
};

export default function RewardsPage() {
  return <RewardsContent />;
}
