export type Machine = {
  slug: string;
  name: string;
  type: "Floor-standing" | "Countertop";
  tag: string;
  accent: "violet" | "green";
  image: string;
  short: string;
  description: string;
  menu: string[];
  idealFor: string[];
  highlights: { title: string; text: string }[];
  specs: [string, string][];
};

const floorSpecs: [string, string][] = [
  ["Dimensions", "L1080 × W940 × H1950 mm"],
  ["Weight", "368 kg"],
  ["Touchscreen", "32-inch HD display"],
  ["Mix hopper", "19 L"],
  ["Freezing cylinder", "2 L"],
  ["Output", "Up to 120 cups / hour"],
  ["Voltage", "110 V / 220 V (optional)"],
  ["Frequency", "50 Hz / 60 Hz (optional)"],
  ["Rated power", "1800 W"],
  ["Compressor", "Embraco"],
  ["Payments", "Card, NFC, QR wallets, cash (per market)"],
];

const floorHighlights = [
  { title: "32-inch touchscreen", text: "Large display for the menu, ordering guidance and your client's promotional content." },
  { title: "Fast, stable cooling", text: "Commercial refrigeration keeps soft serve consistent through peak-hour demand." },
  { title: "Flexible payments", text: "Cash, card, QR and NFC, integrated to suit each country and location." },
  { title: "Remote management", text: "Sales, stock and machine status in the X&Y3 Cloud dashboard." },
];

export const machines: Machine[] = [
  {
    slug: "xy-max",
    name: "XY-Max",
    type: "Floor-standing",
    tag: "Flagship",
    accent: "violet",
    image: "/images/xy-max.webp",
    short: "Premium, high-capacity machine with a topper sign for maximum visibility in busy venues.",
    description:
      "XY-Max is the flagship of the range. It's built for malls, airports and stadiums, where it has to catch attention from a distance and serve a steady queue. It adds a rooftop sign, a 32-inch screen and a full topping bay, all finished in your client's brand.",
    menu: ["Soft serve", "Açaí", "Sundaes", "3 sauces + 3 dry toppings"],
    idealFor: ["Shopping malls", "Airports & transit", "Stadiums", "Theme parks"],
    highlights: floorHighlights,
    specs: floorSpecs,
  },
  {
    slug: "xy-classic",
    name: "XY-Classic",
    type: "Floor-standing",
    tag: "Best seller",
    accent: "green",
    image: "/images/xy-classic.webp",
    short: "Full-size commercial unit that balances footprint and output, and suits most indoor venues.",
    description:
      "XY-Classic is the all-rounder: the same 120 cups an hour and 32-inch screen as the flagship, in a clean, wrap-ready cabinet. Customers choose on the touchscreen, pay, watch it being made, and collect a finished cup.",
    menu: ["Soft serve", "Cups & toppings", "Seasonal flavors"],
    idealFor: ["Cinemas", "Family entertainment centers", "Hospitals", "Offices"],
    highlights: floorHighlights,
    specs: floorSpecs,
  },
  {
    slug: "xy-swirl",
    name: "XY-Swirl",
    type: "Floor-standing",
    tag: "Dessert",
    accent: "violet",
    image: "/images/xy-swirl.webp",
    short: "Soft-serve dessert specialist with sauce and dry toppings and a premium on-screen menu.",
    description:
      "XY-Swirl is designed around the dessert moment. Screen-led merchandising sells the sundae, Omron sensors keep cup dispensing reliable, and the whole order runs without staff.",
    menu: ["Sundaes", "Soft serve", "Sauces & crunchy toppings"],
    idealFor: ["Dessert brands", "Restaurants", "Hotels", "Resorts"],
    highlights: [
      ...floorHighlights.slice(0, 2),
      { title: "Reliable cup dispensing", text: "Omron sensors detect cups for stable automatic dispensing." },
      floorHighlights[3],
    ],
    specs: floorSpecs,
  },
  {
    slug: "xy-bowl",
    name: "XY-Bowl",
    type: "Floor-standing",
    tag: "Healthy menu",
    accent: "green",
    image: "/images/xy-bowl.webp",
    short: "Frozen yogurt and açaí bowls, built for gyms, campuses and wellness locations.",
    description:
      "XY-Bowl brings the healthy-dessert trend to self-service. It serves frozen yogurt and açaí with fruit and granola toppings at premium prices, so a gym, campus or office gets a café-quality treat without staffing a counter.",
    menu: ["Frozen yogurt", "Açaí", "Fruit & granola toppings"],
    idealFor: ["Gyms", "Universities", "Corporate offices", "Wellness centers"],
    highlights: floorHighlights,
    specs: floorSpecs,
  },
  {
    slug: "xy-compact",
    name: "XY-Compact",
    type: "Countertop",
    tag: "Compact",
    accent: "violet",
    image: "/images/xy-compact.webp",
    short: "Fully automatic countertop machine for cafés, hotels, offices and convenience stores.",
    description:
      "XY-Compact puts automatic soft serve on any counter. It's light, and it vents through the top, so it fits on a bar or front desk without special space. You can watch it, and every machine in the store, from your phone.",
    menu: ["Soft serve", "Cups & cones"],
    idealFor: ["Cafés", "Hotels", "Convenience stores", "Fuel stations"],
    highlights: [
      { title: "Fits anywhere", text: "Small footprint and top exhaust, so it works on bars, counters and front desks." },
      { title: "High output", text: "Up to 180 cups per hour from a 3.8 L container." },
      { title: "Eco refrigerant", text: "Runs on R290 natural refrigerant." },
      { title: "Phone control", text: "Remote control, status alerts and live sales on mobile." },
    ],
    specs: [
      ["Dimensions", "L660 × W334 × H622 mm"],
      ["Weight", "80.5 kg"],
      ["Touchscreen", "11.6-inch"],
      ["Container", "3.8 L"],
      ["Output", "Up to 180 cups / hour"],
      ["Voltage", "220 V"],
      ["Total power", "1300 W (standby 280 W)"],
      ["Refrigerant", "R290"],
    ],
  },
  {
    slug: "xy-desk",
    name: "XY-Desk",
    type: "Countertop",
    tag: "Scan-to-order",
    accent: "green",
    image: "/images/xy-desk.webp",
    short: "Desktop unit with built-in scan-to-order and DIY toppings for kiosks and dessert counters.",
    description:
      "XY-Desk makes the whole ice cream with one tap. Built-in QR and card payment means no extra payment hardware, and two toppings plus two sauces give customers more than 10 flavor combinations. It takes only 0.46 m² of space.",
    menu: ["Soft serve", "2 toppings + 2 sauces", "10+ flavor combos"],
    idealFor: ["Kiosks", "Dessert counters", "Cinemas", "Small venues"],
    highlights: [
      { title: "One-tap operation", text: "The machine completes the whole process, with no staff training needed." },
      { title: "Built-in payments", text: "Scan-to-pay and card reader integrated, with no extra hardware." },
      { title: "DIY flavors", text: "Two toppings and two sauces for more than 10 combinations." },
      { title: "Tiny footprint", text: "Takes 0.46 m², with a matching storage shelf included." },
    ],
    specs: [
      ["Dimensions", "L560 × W826 × H812 mm"],
      ["Weight", "230 kg"],
      ["Touchscreen", "13.3-inch"],
      ["Cup holder", "32 cups"],
      ["Mix capacity", "10 L"],
      ["Power supply", "220 V · 50 / 60 Hz"],
      ["Refrigerant", "R404a"],
      ["Power unit", "Mean Well switching supply"],
    ],
  },
];

export function getMachine(slug: string) {
  return machines.find((m) => m.slug === slug);
}
