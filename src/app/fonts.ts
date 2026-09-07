import localFont from "next/font/local";
import { Cabin } from "next/font/google";

export const stencil = localFont({
  src: "../../public/fonts/Oswald-Stencil.ttf",
  variable: "--font-stencil",
  display: "swap",
});

export const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cabin",
  display: "swap",
});
