import type { Lang } from "@/i18n/config";

export type SpecKey =
  | "dims" | "weight" | "screen" | "hopper" | "cylinder" | "output" | "voltage" | "frequency"
  | "power" | "compressor" | "payments" | "container" | "refrigerant" | "cups" | "mix" | "supply" | "psu";

export const specLabels: Record<Lang, Record<SpecKey, string>> = {
  en: {
    dims: "Dimensions", weight: "Weight", screen: "Touchscreen", hopper: "Mix hopper", cylinder: "Freezing cylinder",
    output: "Output", voltage: "Voltage", frequency: "Frequency", power: "Rated power", compressor: "Compressor",
    payments: "Payments", container: "Container", refrigerant: "Refrigerant", cups: "Cup holder", mix: "Mix capacity",
    supply: "Power supply", psu: "Power unit",
  },
  ar: {
    dims: "الأبعاد", weight: "الوزن", screen: "الشاشة اللمسية", hopper: "خزان الخليط", cylinder: "أسطوانة التجميد",
    output: "الإنتاج", voltage: "الجهد الكهربائي", frequency: "التردد", power: "القدرة الاسمية", compressor: "الضاغط",
    payments: "طرق الدفع", container: "سعة الحاوية", refrigerant: "غاز التبريد", cups: "حامل الأكواب", mix: "سعة الخليط",
    supply: "مصدر الطاقة", psu: "وحدة الطاقة",
  },
};

type Content = {
  tag: string;
  short: string;
  description: string;
  menu: string[];
  idealFor: string[];
  highlights: { title: string; text: string }[];
  specs: [SpecKey, string][];
};

type Base = { slug: string; name: string; kind: "floor" | "counter"; accent: "violet" | "green"; image: string };
export type Machine = Base & Content;

const base: Base[] = [
  { slug: "xy-max", name: "XY-Max", kind: "floor", accent: "violet", image: "/images/xy-max.webp" },
  { slug: "xy-classic", name: "XY-Classic", kind: "floor", accent: "green", image: "/images/xy-classic.webp" },
  { slug: "xy-swirl", name: "XY-Swirl", kind: "floor", accent: "violet", image: "/images/xy-swirl.webp" },
  { slug: "xy-bowl", name: "XY-Bowl", kind: "floor", accent: "green", image: "/images/xy-bowl.webp" },
  { slug: "xy-compact", name: "XY-Compact", kind: "counter", accent: "violet", image: "/images/xy-compact.webp" },
  { slug: "xy-desk", name: "XY-Desk", kind: "counter", accent: "green", image: "/images/xy-desk.webp" },
];

/* ---------------- English ---------------- */
const floorSpecsEn: [SpecKey, string][] = [
  ["dims", "L1080 × W940 × H1950 mm"], ["weight", "368 kg"], ["screen", "32-inch HD display"], ["hopper", "19 L"],
  ["cylinder", "2 L"], ["output", "Up to 120 cups / hour"], ["voltage", "110 V / 220 V (optional)"],
  ["frequency", "50 Hz / 60 Hz (optional)"], ["power", "1800 W"], ["compressor", "Embraco"],
  ["payments", "Card, NFC, QR wallets, cash (per market)"],
];
const floorHlEn = [
  { title: "32-inch touchscreen", text: "Large display for the menu, ordering guidance and your client's promotional content." },
  { title: "Fast, stable cooling", text: "Commercial refrigeration keeps soft serve consistent through peak-hour demand." },
  { title: "Flexible payments", text: "Cash, card, QR and NFC, integrated to suit each country and location." },
  { title: "Remote management", text: "Sales, stock and machine status in the X&Y3 Cloud dashboard." },
];

const en: Record<string, Content> = {
  "xy-max": {
    tag: "Flagship",
    short: "Premium, high-capacity machine with a topper sign for maximum visibility in busy venues.",
    description: "XY-Max is the flagship of the range. It's built for malls, airports and stadiums, where it has to catch attention from a distance and serve a steady queue. It adds a rooftop sign, a 32-inch screen and a full topping bay, all finished in your client's brand.",
    menu: ["Soft serve", "Açaí", "Sundaes", "3 sauces + 3 dry toppings"],
    idealFor: ["Shopping malls", "Airports & transit", "Stadiums", "Theme parks"],
    highlights: floorHlEn, specs: floorSpecsEn,
  },
  "xy-classic": {
    tag: "Best seller",
    short: "Full-size commercial unit that balances footprint and output, and suits most indoor venues.",
    description: "XY-Classic is the all-rounder: the same 120 cups an hour and 32-inch screen as the flagship, in a clean, wrap-ready cabinet. Customers choose on the touchscreen, pay, watch it being made, and collect a finished cup.",
    menu: ["Soft serve", "Cups & toppings", "Seasonal flavors"],
    idealFor: ["Cinemas", "Family entertainment centers", "Hospitals", "Offices"],
    highlights: floorHlEn, specs: floorSpecsEn,
  },
  "xy-swirl": {
    tag: "Dessert",
    short: "Soft-serve dessert specialist with sauce and dry toppings and a premium on-screen menu.",
    description: "XY-Swirl is designed around the dessert moment. Screen-led merchandising sells the sundae, Omron sensors keep cup dispensing reliable, and the whole order runs without staff.",
    menu: ["Sundaes", "Soft serve", "Sauces & crunchy toppings"],
    idealFor: ["Dessert brands", "Restaurants", "Hotels", "Resorts"],
    highlights: [floorHlEn[0], floorHlEn[1], { title: "Reliable cup dispensing", text: "Omron sensors detect cups for stable automatic dispensing." }, floorHlEn[3]],
    specs: floorSpecsEn,
  },
  "xy-bowl": {
    tag: "Healthy menu",
    short: "Frozen yogurt and açaí bowls, built for gyms, campuses and wellness locations.",
    description: "XY-Bowl brings the healthy-dessert trend to self-service. It serves frozen yogurt and açaí with fruit and granola toppings at premium prices, so a gym, campus or office gets a café-quality treat without staffing a counter.",
    menu: ["Frozen yogurt", "Açaí", "Fruit & granola toppings"],
    idealFor: ["Gyms", "Universities", "Corporate offices", "Wellness centers"],
    highlights: floorHlEn, specs: floorSpecsEn,
  },
  "xy-compact": {
    tag: "Compact",
    short: "Fully automatic countertop machine for cafés, hotels, offices and convenience stores.",
    description: "XY-Compact puts automatic soft serve on any counter. It's light, and it vents through the top, so it fits on a bar or front desk without special space. You can watch it, and every machine in the store, from your phone.",
    menu: ["Soft serve", "Cups & cones"],
    idealFor: ["Cafés", "Hotels", "Convenience stores", "Fuel stations"],
    highlights: [
      { title: "Fits anywhere", text: "Small footprint and top exhaust, so it works on bars, counters and front desks." },
      { title: "High output", text: "Up to 180 cups per hour from a 3.8 L container." },
      { title: "Eco refrigerant", text: "Runs on R290 natural refrigerant." },
      { title: "Phone control", text: "Remote control, status alerts and live sales on mobile." },
    ],
    specs: [
      ["dims", "L660 × W334 × H622 mm"], ["weight", "80.5 kg"], ["screen", "11.6-inch"], ["container", "3.8 L"],
      ["output", "Up to 180 cups / hour"], ["voltage", "220 V"], ["power", "1300 W (standby 280 W)"], ["refrigerant", "R290"],
    ],
  },
  "xy-desk": {
    tag: "Scan-to-order",
    short: "Desktop unit with built-in scan-to-order and DIY toppings for kiosks and dessert counters.",
    description: "XY-Desk makes the whole ice cream with one tap. Built-in QR and card payment means no extra payment hardware, and two toppings plus two sauces give customers more than 10 flavor combinations. It takes only 0.46 m² of space.",
    menu: ["Soft serve", "2 toppings + 2 sauces", "10+ flavor combos"],
    idealFor: ["Kiosks", "Dessert counters", "Cinemas", "Small venues"],
    highlights: [
      { title: "One-tap operation", text: "The machine completes the whole process, with no staff training needed." },
      { title: "Built-in payments", text: "Scan-to-pay and card reader integrated, with no extra hardware." },
      { title: "DIY flavors", text: "Two toppings and two sauces for more than 10 combinations." },
      { title: "Tiny footprint", text: "Takes 0.46 m², with a matching storage shelf included." },
    ],
    specs: [
      ["dims", "L560 × W826 × H812 mm"], ["weight", "230 kg"], ["screen", "13.3-inch"], ["cups", "32 cups"],
      ["mix", "10 L"], ["supply", "220 V · 50 / 60 Hz"], ["refrigerant", "R404a"], ["psu", "Mean Well switching supply"],
    ],
  },
};

/* ---------------- Arabic ---------------- */
const floorSpecsAr: [SpecKey, string][] = [
  ["dims", "1080 × 940 × 1950 مم (ط × ع × ار)"], ["weight", "368 كغ"], ["screen", "شاشة عالية الدقة 32 بوصة"],
  ["hopper", "19 لتر"], ["cylinder", "2 لتر"], ["output", "حتى 120 كوباً في الساعة"],
  ["voltage", "110 / 220 فولت (اختياري)"], ["frequency", "50 / 60 هرتز (اختياري)"], ["power", "1800 واط"],
  ["compressor", "Embraco"], ["payments", "بطاقات، NFC، محافظ QR، نقد (حسب السوق)"],
];
const floorHlAr = [
  { title: "شاشة لمسية 32 بوصة", text: "شاشة كبيرة لعرض القائمة وإرشادات الطلب والمحتوى الترويجي لعميلك." },
  { title: "تبريد سريع ومستقر", text: "نظام تبريد تجاري يحافظ على جودة الآيس كريم الطري في أوقات الذروة." },
  { title: "دفع مرن", text: "نقد وبطاقات وQR وNFC، مدمجة بما يناسب كل دولة وموقع." },
  { title: "إدارة عن بُعد", text: "المبيعات والمخزون وحالة الآلة عبر لوحة X&Y3 Cloud." },
];

const ar: Record<string, Content> = {
  "xy-max": {
    tag: "الطراز الرئيسي",
    short: "آلة فاخرة عالية السعة مع لافتة علوية لأقصى درجات الظهور في الأماكن المزدحمة.",
    description: "XY-Max هي الطراز الرئيسي في المجموعة، صُمّمت للمراكز التجارية والمطارات والملاعب حيث يجب أن تلفت الأنظار من بعيد وتخدم طابوراً مستمراً. تضيف لافتة علوية وشاشة 32 بوصة وحجرة كاملة للإضافات، وكلها بعلامة عميلك التجارية.",
    menu: ["آيس كريم طري", "أساي", "صنداي", "3 صلصات + 3 إضافات جافة"],
    idealFor: ["المراكز التجارية", "المطارات ومحطات النقل", "الملاعب", "المتنزهات الترفيهية"],
    highlights: floorHlAr, specs: floorSpecsAr,
  },
  "xy-classic": {
    tag: "الأكثر مبيعاً",
    short: "آلة تجارية كاملة الحجم توازن بين المساحة والإنتاج، وتناسب معظم الأماكن الداخلية.",
    description: "XY-Classic هي الآلة متعددة الاستخدامات: الإنتاج نفسه (120 كوباً في الساعة) والشاشة نفسها (32 بوصة) في هيكل أنيق جاهز للتغليف. يختار العميل من الشاشة، ويدفع، ويشاهد التحضير، ثم يستلم كوبه جاهزاً.",
    menu: ["آيس كريم طري", "أكواب وإضافات", "نكهات موسمية"],
    idealFor: ["دور السينما", "مراكز الترفيه العائلي", "المستشفيات", "المكاتب"],
    highlights: floorHlAr, specs: floorSpecsAr,
  },
  "xy-swirl": {
    tag: "حلويات",
    short: "متخصّصة في حلويات الآيس كريم الطري مع صلصات وإضافات مقرمشة وقائمة فاخرة على الشاشة.",
    description: "صُمّمت XY-Swirl حول لحظة الحلوى. العرض المرئي على الشاشة يبيع الصنداي، وحسّاسات Omron تضمن صرف الأكواب بثبات، ويتم الطلب بالكامل دون موظفين.",
    menu: ["صنداي", "آيس كريم طري", "صلصات وإضافات مقرمشة"],
    idealFor: ["علامات الحلويات", "المطاعم", "الفنادق", "المنتجعات"],
    highlights: [floorHlAr[0], floorHlAr[1], { title: "صرف أكواب موثوق", text: "حسّاسات Omron تكشف الأكواب لصرف تلقائي مستقر." }, floorHlAr[3]],
    specs: floorSpecsAr,
  },
  "xy-bowl": {
    tag: "قائمة صحية",
    short: "أوعية الزبادي المجمّد والأساي، مصمّمة للنوادي الرياضية والجامعات ومراكز العافية.",
    description: "تنقل XY-Bowl رواج الحلويات الصحية إلى البيع الذاتي. تقدّم الزبادي المجمّد والأساي مع الفواكه والجرانولا بأسعار مميّزة، ليحصل النادي أو الجامعة أو المكتب على تجربة بمستوى المقاهي دون موظف.",
    menu: ["زبادي مجمّد", "أساي", "فواكه وجرانولا"],
    idealFor: ["النوادي الرياضية", "الجامعات", "مكاتب الشركات", "مراكز العافية"],
    highlights: floorHlAr, specs: floorSpecsAr,
  },
  "xy-compact": {
    tag: "مدمجة",
    short: "آلة مكتبية أوتوماتيكية بالكامل للمقاهي والفنادق والمكاتب والمتاجر.",
    description: "تضع XY-Compact الآيس كريم الطري الأوتوماتيكي على أي منضدة. خفيفة الوزن وتُخرج الهواء من الأعلى، فتناسب الكاونتر أو مكتب الاستقبال دون مساحة خاصة، ويمكنك متابعتها مع جميع آلات المتجر من هاتفك.",
    menu: ["آيس كريم طري", "أكواب وأقماع"],
    idealFor: ["المقاهي", "الفنادق", "المتاجر", "محطات الوقود"],
    highlights: [
      { title: "تناسب أي مكان", text: "مساحة صغيرة وتهوية علوية، فتعمل على الكاونترات والمناضد ومكاتب الاستقبال." },
      { title: "إنتاج عالٍ", text: "حتى 180 كوباً في الساعة من حاوية سعتها 3.8 لتر." },
      { title: "غاز تبريد صديق للبيئة", text: "تعمل بغاز التبريد الطبيعي R290." },
      { title: "تحكّم من الهاتف", text: "تحكّم عن بُعد وتنبيهات الحالة والمبيعات المباشرة على الجوال." },
    ],
    specs: [
      ["dims", "660 × 334 × 622 مم (ط × ع × ار)"], ["weight", "80.5 كغ"], ["screen", "11.6 بوصة"], ["container", "3.8 لتر"],
      ["output", "حتى 180 كوباً في الساعة"], ["voltage", "220 فولت"], ["power", "1300 واط (الاستعداد 280 واط)"], ["refrigerant", "R290"],
    ],
  },
  "xy-desk": {
    tag: "اطلب بالمسح",
    short: "آلة مكتبية مع طلب بالمسح وإضافات حسب الرغبة، للأكشاك ومنصّات الحلويات.",
    description: "تحضّر XY-Desk الآيس كريم بالكامل بلمسة واحدة. الدفع المدمج عبر QR والبطاقات يغني عن أجهزة دفع إضافية، وإضافتان وصلصتان تمنحان العميل أكثر من 10 تركيبات نكهات، وكل ذلك في مساحة 0.46 م² فقط.",
    menu: ["آيس كريم طري", "إضافتان + صلصتان", "أكثر من 10 تركيبات"],
    idealFor: ["الأكشاك", "منصّات الحلويات", "دور السينما", "الأماكن الصغيرة"],
    highlights: [
      { title: "تشغيل بلمسة واحدة", text: "تُنجز الآلة العملية بالكامل دون الحاجة لتدريب الموظفين." },
      { title: "دفع مدمج", text: "الدفع بالمسح وقارئ البطاقات مدمجان دون أجهزة إضافية." },
      { title: "نكهات حسب الرغبة", text: "إضافتان وصلصتان لأكثر من 10 تركيبات." },
      { title: "مساحة صغيرة جداً", text: "تشغل 0.46 م² فقط، مع رف تخزين مطابق." },
    ],
    specs: [
      ["dims", "560 × 826 × 812 مم (ط × ع × ار)"], ["weight", "230 كغ"], ["screen", "13.3 بوصة"], ["cups", "32 كوباً"],
      ["mix", "10 لتر"], ["supply", "220 فولت · 50 / 60 هرتز"], ["refrigerant", "R404a"], ["psu", "مزوّد طاقة Mean Well"],
    ],
  },
};

const content: Record<Lang, Record<string, Content>> = { en, ar };

export const machineSlugs = base.map((m) => m.slug);

export function getMachines(lang: Lang): Machine[] {
  return base.map((b) => ({ ...b, ...content[lang][b.slug] }));
}

export function getMachine(lang: Lang, slug: string): Machine | undefined {
  const b = base.find((m) => m.slug === slug);
  return b ? { ...b, ...content[lang][slug] } : undefined;
}
