import { redirect } from "next/navigation";

// Shipping now lives inside the orders dashboard.
export default function ShippingRedirect() {
  redirect("/admin");
}
