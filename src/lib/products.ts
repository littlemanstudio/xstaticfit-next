export type Product = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  category: "training" | "apparel";
  description: string;
  metaTitle: string;
  metaDescription: string;
  detail?: string;
  variantLabel?: string;
  variants?: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "xstatic-carbon-grips",
    name: "Xstatic Carbon Grips",
    price: 40,
    compareAtPrice: 50,
    image: "/images/grips/2.jpg",
    images: [
      "/images/grips/2.jpg",
      "/images/grips/1.jpg",
      "/images/grips/3.jpg",
      "/images/grips/4.jpg",
      "/images/grips/5.jpg",
      "/images/grips/6.jpg",
      "/images/grips/7.jpg",
    ],
    category: "training",
    description:
      "Grip with confidence. Built from carbon fiber-infused rubber, these ultra-durable grips protect your hands while giving you maximum control during pull-ups, lifts, and intense workouts. No slips, no rips, just pure performance with every rep.",
    metaTitle: "Xstatic Carbon Grips for Pull-Ups & Lifts",
    metaDescription:
      "Carbon fiber-infused Xstatic Grips protect your hands through pull-ups, lifts, and max-intensity training sets. No slips, no rips, just grip you can trust.",
    variantLabel: "Select Xstatic Grips",
    variants: ["Grips"],
  },
  {
    slug: "xstatic-weighted-jump-ropes",
    name: "Xstatic Weighted Jump Ropes",
    price: 25,
    compareAtPrice: 35,
    image: "/images/ropes/4.jpg",
    images: [
      "/images/ropes/4.jpg",
      "/images/ropes/1.jpg",
      "/images/ropes/2.jpg",
      "/images/ropes/3.jpg",
    ],
    category: "training",
    description:
      "Cardio your way. Engineered for performance and versatility, the Xstatic Fit Jump Rope features an adjustable length for a custom fit and insertable weights (included) to level up intensity. Built with premium materials for lasting durability, it's perfect for both beginners and pros looking to boost endurance, speed, and strength, all in one sleek tool.",
    metaTitle: "Xstatic Weighted Jump Ropes for Cardio",
    metaDescription:
      "Adjustable weighted jump rope built for real cardio gains. Insertable weights, premium materials, and a custom fit for beginners and pros training at home.",
  },
  {
    slug: "xstatic-door-pull-up-bar",
    name: "Xstatic Door Pull Up Bar",
    price: 60,
    compareAtPrice: 69.99,
    image: "/images/pullupbar/1.jpg",
    images: ["/images/pullupbar/1.jpg", "/images/pullupbar/2.jpg"],
    category: "training",
    description:
      "Turn any room into a gym. Our adjustable pull-up bar extends to fit most door frames or wall spaces. This means no screws, no damage. Built with heavy-duty materials and tested to hold up to 330 lbs, it's the ultimate tool for full upper-body training at home, anytime. Measurements: 72-110cm",
    metaTitle: "Xstatic Adjustable Door Pull-Up Bar, 330 lbs",
    metaDescription:
      "Heavy-duty adjustable door pull-up bar, no screws required. Holds up to 330 lbs and turns any doorway into a full upper-body training gym at home today.",
    variantLabel: "Select Width",
    variants: ["72-110 cm"],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelated(slug: string) {
  return PRODUCTS.filter((p) => p.slug !== slug);
}

export const FAQS = [
  {
    q: "Do you guys have discounts?",
    a: "Be on the lookout to unlock extra savings with our exclusive bundle offer! Purchase all three items in one go and enjoy a generous 10% discount on your total order. It's our way of saying thank you for choosing to complete your collection with us. We offer a 10% discount if you purchase all 3 items.",
  },
  {
    q: "Does Xstatic Fit clothing run true to size?",
    a: "Our training gear is built to a standard adult fit. If you're between sizes, we recommend sizing up for comfort during high-intensity movement.",
  },
  {
    q: "What is Xstatic Fit's Return Policy?",
    a: "Change of heart? No problem, Xstatic Fit provides a 14 day return policy in case you doubt yourself. Item needs to be returned in sellable condition. (Shipping charge not included)",
  },
  {
    q: "When can I expect my refund?",
    a: "After the item has arrived to our facility & it is approved we will issue your refund.",
  },
];
