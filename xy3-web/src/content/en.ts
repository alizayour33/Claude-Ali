// All site copy lives here, following the X&Y3 Website Design & Developer Specification v1.0.
// Rules from the spec: no manufacturer, exclusivity, territory, response-time, uptime, ROI,
// certification or service-network claims unless verified. X&Y3 is never the manufacturer.

const en = {
  meta: {
    title: "X&Y3 · International Robotic Solutions",
    description:
      "X&Y3 connects advanced robotic technology with the expertise to deploy, operate and support it across international markets.",
  },
  nav: {
    home: "Home",
    solutions: "Solutions",
    services: "Services",
    industries: "Industries",
    connect: "X&Y3 Connect",
    support: "Support",
    about: "About",
    cta: "Start a Project",
    menu: "Menu",
    skip: "Skip to content",
    solutionItems: [
      { label: "Frozen Dessert Robotics", path: "/solutions/frozen-dessert", note: "Soft serve, frozen yogurt, açaí" },
      { label: "Br3wBot Coffee Robotics", path: "/solutions/br3wbot", note: "The robotic barista" },
      { label: "Emerging Robotic Solutions", path: "/solutions/emerging", note: "What comes next" },
    ],
  },
  footer: {
    line: "The robot is the technology. X&Y3 is what makes it work.",
    explore: "Explore",
    company: "Company",
    legal: "Legal",
    partner: "Partner With X&Y3",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    rights: "All rights reserved.",
    note: "Product brands belong to their respective owners. X&Y3 provides deployment, service and the operating ecosystem around them.",
  },
  common: {
    explore: "Explore",
    attribution: "Technology by our manufacturing partner. Deployment & technical support by X&Y3.",
    attributionBr3wbot: "Br3wBot is a product brand of its manufacturer. Deployment & technical support by X&Y3.",
    photoPending: "Photo pending",
    conceptPreview: "Concept preview. Features are in development and shown for illustration.",
  },
  finalCta: {
    eyebrow: "Your next robotic project",
    title: "Let's Build What's Next.",
    text: "Whether you're exploring your first robotic concept, expanding an existing operation or looking for a technology and service partner in your market, let's talk.",
    cta: "Start a Project",
  },

  /* ------------------------------ HOME ------------------------------ */
  home: {
    hero: {
      eyebrow: "International robotic solutions",
      title: "Robotics Made Operational.",
      text: "X&Y3 connects advanced robotic technology with the expertise required to deploy, operate and support it successfully. From installation and commissioning to training, software visibility and ongoing technical support.",
      cta1: "Explore Solutions",
      cta2: "Start a Project",
      line: "Robotic Technology. Deployment. Support. One Partner.",
      alt: "Automated soft-serve robot with a finished cup of ice cream",
    },
    beyond: {
      eyebrow: "Beyond the machine",
      title: "The Machine Is Only the Beginning.",
      text: "Successful automation requires more than great hardware. X&Y3 works between technology manufacturers and operators to transform robotic equipment into reliable, operational businesses.",
      strip: ["Select", "Configure", "Deploy", "Install", "Commission", "Train", "Monitor", "Support"],
    },
    solutions: {
      title: "Robotic Solutions for Real Business.",
      cards: [
        { title: "Frozen Dessert Robotics", text: "Automated soft serve, frozen yogurt, açaí and specialty frozen-dessert concepts.", path: "/solutions/frozen-dessert", image: "/images/slide-acai.webp", alt: "Açaí concept frozen-dessert robots" },
        { title: "Coffee Robotics", text: "Br3wBot: robotic movement and professional coffee preparation, cup after cup.", path: "/solutions/br3wbot", image: "", alt: "Br3wBot coffee robot" },
        { title: "Emerging Robotic Solutions", text: "Future food, beverage and commercial automation technologies.", path: "/solutions/emerging", image: "", alt: "" },
      ],
    },
    differentiator: {
      title: "We Don't Just Deliver Robots. We Make Robotics Work.",
      cards: [
        ["International Deployment", "Coordination from manufacturer to destination, within X&Y3's scope."],
        ["Installation & Commissioning", "Setup, testing, configuration and operational handover."],
        ["Training", "Daily operation for your team and service procedures for authorized personnel."],
        ["Technical Support", "Structured remote diagnosis and a clear support workflow."],
        ["Spare Parts", "Identification, sourcing and coordination of the parts you need."],
        ["After-Sales Service", "An ongoing operational and technical relationship."],
      ],
    },
    connect: {
      eyebrow: "X&Y3 Connect",
      title: "Your Robotic Operation. One View.",
      text: "Machines, sales, inventory, alerts, technical resources and support, connected through one customer platform.",
      chips: ["Machine Health", "Sales & Performance", "Inventory", "Alerts & Errors", "Service Requests", "Parts", "Training & Repair Videos", "Documents"],
      cta: "Discover X&Y3 Connect",
    },
    lifecycle: {
      title: "One Partner. From Factory to Operation.",
      steps: [
        ["Understand", "Your concept, site and goals."],
        ["Select", "The right technology for the application."],
        ["Prepare", "Site planning and pre-install requirements."],
        ["Deploy", "Logistics, installation and commissioning."],
        ["Train", "Operators and authorized technicians."],
        ["Support", "Technical support, parts and after-sales."],
      ],
      closing: "Our relationship doesn't end when your robot arrives. That's where it begins.",
    },
    international: {
      title: "International Expertise. Local Execution.",
      text: "Built for international markets, X&Y3 combines manufacturer relationships, regional expertise and technical support to help businesses deploy robotic solutions across borders.",
      note: "International coordination. Regional support as available.",
    },
    about: {
      eyebrow: "Built from experience",
      title: "Technology Needs People Who Understand It.",
      text: "X&Y3 was created from hands-on experience deploying and supporting automated foodservice technology, from logistics and installation to commissioning, training, software integration and after-sales support.",
      cta: "Our Story",
    },
  },

  /* ---------------------------- SOLUTIONS ---------------------------- */
  solutions: {
    metaTitle: "Solutions",
    metaDesc: "Robotic technologies selected for the real world: frozen dessert robotics, Br3wBot coffee robotics and emerging solutions.",
    hero: {
      eyebrow: "Robotic solutions",
      title: "Technology Selected for the Real World.",
      text: "X&Y3 brings together advanced robotic technologies and the operational expertise required to deploy them successfully across international markets.",
      cta: "Find Your Solution",
    },
    families: [
      {
        id: "frozen-dessert",
        eyebrow: "Solution family",
        title: "Frozen Dessert Robotics",
        text: "Automated soft serve, frozen yogurt, açaí and specialty frozen-dessert concepts. One platform that can be configured around your product and your concept.",
        cta: "Explore Frozen Dessert Robotics",
        path: "/solutions/frozen-dessert",
        image: "/images/slide-brand.webp",
        alt: "Automated soft-serve robot",
      },
      {
        id: "br3wbot",
        eyebrow: "Coffee Robotics",
        title: "Br3wBot",
        text: "Robotic movement, professional coffee preparation and consistency, with a customer experience people stop to watch. X&Y3 adds the operational support layer around it.",
        cta: "Discover Br3wBot",
        path: "/solutions/br3wbot",
        image: "",
        alt: "Br3wBot coffee robot",
      },
      {
        id: "emerging",
        eyebrow: "Solution family",
        title: "Emerging Robotic Solutions",
        text: "Future food, beverage and commercial automation technologies. As new systems prove themselves, X&Y3 evaluates them for international deployment.",
        cta: "Discuss a Project",
        path: "/solutions/emerging",
        image: "",
        alt: "",
      },
    ],
    rule: {
      title: "How we work with manufacturers",
      text: "X&Y3 does not manufacture robots. We identify appropriate systems from qualified manufacturers and provide the deployment, service and operating ecosystem around them. Product brands remain product brands.",
    },
  },

  /* -------------------------- FROZEN DESSERT -------------------------- */
  frozen: {
    metaTitle: "Frozen Dessert Robotics",
    metaDesc: "Fully automated soft serve, frozen yogurt and açaí concepts, deployed and supported by X&Y3.",
    hero: {
      eyebrow: "Frozen Dessert Robotics",
      title: "Soft Serve Reimagined. Fully Automated.",
      text: "A self-service robotic platform that takes the order, prepares the dessert and serves it, in a footprint designed for public venues.",
      cta: "Discuss a Frozen Dessert Project",
      alt: "Automated soft-serve robot with a cup of soft serve",
    },
    intro: {
      title: "An automated dessert counter.",
      text: "The customer chooses on the touchscreen, pays, and watches the dessert being prepared. The machine handles ordering, payment, production and pickup, while your team focuses on replenishment, cleaning and routine service.",
      points: [
        ["Order", "A touchscreen menu guides the choice."],
        ["Prepare", "The machine makes each serving automatically."],
        ["Serve", "The finished cup is presented at the pickup window."],
      ],
    },
    platform: {
      title: "One platform. Many possibilities.",
      text: "The same robotic platform can be configured for different products, where technically supported.",
      items: [
        ["Soft Serve", "Classic soft serve with sauces and toppings."],
        ["Frozen Yogurt", "A lighter menu for health-minded venues."],
        ["Açaí", "A premium açaí concept."],
        ["Specialty & Seasonal", "Other concepts, subject to technical review."],
      ],
    },
    gallery: {
      title: "Concept gallery",
      text: "The exterior, screen and menu adapt to the concept. These are examples of concept directions.",
      items: [
        { label: "Classic Soft Serve", image: "/images/hero-machines.webp", alt: "Two concept wraps on the frozen-dessert platform" },
        { label: "Açaí", image: "/images/slide-acai.webp", alt: "Açaí concept machines" },
        { label: "Mango", image: "", alt: "Mango concept machine" },
      ],
    },
    support: {
      title: "Operational support from X&Y3",
      text: "The machine arrives with a partner attached.",
      items: ["Site Planning", "Deployment", "Installation", "Commissioning", "Calibration", "Operator Training", "Technical Support", "Spare Parts", "After-Sales"],
    },
    applications: {
      title: "Where it fits",
      text: "Typical locations to consider. Suitability depends on the site, utilities and local requirements.",
      items: ["Shopping centers", "Entertainment venues", "Hotels & resorts", "Universities & campuses", "Transportation hubs", "Corporate sites"],
    },
    specs: "Specifications, site requirements and certifications are provided per project, once verified for your market.",
    cta: { title: "Planning a frozen dessert concept?", text: "Tell us about the location and the concept, and we'll outline the technology and support it requires.", label: "Discuss a Frozen Dessert Project" },
  },

  /* ----------------------------- BR3WBOT ----------------------------- */
  br3wbot: {
    metaTitle: "Br3wBot Coffee Robotics",
    metaDesc: "Br3wBot robotic coffee solution, with deployment, calibration, training and technical support by X&Y3.",
    hero: {
      eyebrow: "Br3wBot · Robotic coffee solution",
      title: "Precision in Motion. Coffee in Every Detail.",
      text: "A robotic barista that turns coffee preparation into something worth watching, backed by the X&Y3 operational support layer.",
      cta1: "Discover Br3wBot",
      cta2: "Request Information",
      alt: "Br3wBot coffee robot",
    },
    band: [
      ["Specialty Coffee", "Built around professional coffee preparation."],
      ["Robotic Precision", "The same movements, every time."],
      ["Consistent Quality", "A repeatable process from cup to cup."],
      ["Operational Efficiency", "Automation for the routine work."],
    ],
    bandNote: "Feature descriptions are indicative and will be confirmed against product documentation.",
    barista: {
      eyebrow: "The robotic barista",
      title: "Movement with Purpose.",
      text: "Every motion has a job: positioning the cup, preparing the coffee, finishing and serving. The robot does the repeatable work in full view of the customer.",
    },
    dark: {
      title: "The Robot Gets Attention. The Coffee Brings Them Back.",
      text: "The movement draws people in. What keeps them returning is a good cup of coffee, prepared the same way each time.",
    },
    flow: { title: "The experience", steps: ["Order", "Prepare", "Brew", "Finish", "Serve"] },
    applications: {
      title: "Applications",
      text: "Locations to consider, where the site is suitable.",
      items: ["Airports", "Hotels", "Shopping centers", "Universities", "Corporate offices", "Hospitals", "Entertainment venues", "Transportation hubs"],
    },
    support: {
      title: "X&Y3 support for Br3wBot",
      items: ["Site Planning", "Deployment", "Installation & Commissioning", "Coffee Calibration", "Operator Training", "Remote Technical Support", "Preventive Maintenance", "Spare Parts", "After-Sales"],
    },
    closing: "Br3wBot provides the technology. X&Y3 keeps the technology moving.",
    cta: { title: "Interested in Br3wBot?", text: "Request product information and discuss what a deployment would involve in your market.", label: "Request Information" },
  },

  /* ----------------------------- EMERGING ----------------------------- */
  emerging: {
    metaTitle: "Emerging Robotic Solutions",
    metaDesc: "Future food, beverage and commercial automation technologies, evaluated by X&Y3 for international deployment.",
    hero: {
      eyebrow: "Emerging Robotic Solutions",
      title: "What Comes Next.",
      text: "Robotics is moving quickly across food, beverage and commercial automation. X&Y3 follows new technologies and evaluates them against one question: can it be deployed, operated and supported in the real world?",
      cta: "Discuss a Project",
    },
    criteria: {
      title: "How we evaluate new technology",
      items: [
        ["A qualified manufacturer", "Proven engineering and a willingness to support international operators."],
        ["Operational readiness", "It has to work every day, not only in a demonstration."],
        ["Serviceability", "Documentation, parts and training must be available."],
        ["A real application", "A clear use case and a location type it suits."],
      ],
    },
    invite: {
      title: "Have a technology or a concept in mind?",
      text: "If you're a manufacturer looking for an international deployment partner, or an operator with an automation idea, we'd like to hear about it.",
    },
  },

  /* ----------------------------- SERVICES ----------------------------- */
  services: {
    metaTitle: "Services",
    metaDesc: "Site planning, deployment, installation, commissioning, training, technical support, spare parts and after-sales from X&Y3.",
    hero: {
      eyebrow: "Services",
      title: "More Than Machines. A Partner for Your Success.",
      text: "Buying the technology is one decision. Making it work every day is another.",
      cta: "Start a Project",
    },
    modulesTitle: "What X&Y3 does",
    modules: [
      ["Site Planning", "Application review, utility and site requirements, operational flow and pre-install preparation."],
      ["International Logistics & Deployment", "Coordination from manufacturer to destination, within X&Y3's scope."],
      ["Installation & Commissioning", "Setup, testing, configuration and operational handover."],
      ["Product Calibration", "Product and recipe calibration, where X&Y3 has the relevant capability."],
      ["Operator Training", "Daily use, cleaning, replenishment and operational procedures."],
      ["Technical Training", "Troubleshooting and service procedures for authorized personnel."],
      ["Remote Technical Support", "A structured diagnosis and support workflow."],
      ["Preventive Maintenance", "A scheduled maintenance program, where offered."],
      ["Spare Parts", "Identification, sourcing and coordination."],
      ["After-Sales", "An ongoing operational and technical relationship."],
    ],
    process: {
      title: "How a project runs",
      steps: [
        ["Consult", "We learn about your concept and site."],
        ["Plan", "Technology, site preparation and logistics."],
        ["Deploy", "Delivery, installation and commissioning."],
        ["Train", "Your operators and technicians."],
        ["Support", "Technical support and parts."],
        ["Grow", "More sites, when you're ready."],
      ],
    },
    coverage: {
      title: "International coordination. Regional support as available.",
      text: "X&Y3 coordinates projects across international markets. Support in each region is confirmed project by project, and we'll be clear about what is available for your location before you commit.",
    },
  },

  /* ---------------------------- INDUSTRIES ---------------------------- */
  industries: {
    metaTitle: "Industries",
    metaDesc: "Where robotic foodservice fits: airports, retail, hospitality, campuses, corporate, entertainment and healthcare environments.",
    hero: {
      eyebrow: "Industries",
      title: "Robotics Where Business Happens.",
      text: "Robotic foodservice suits places with steady foot traffic and a need for consistent service. These examples show where a project could fit.",
      cta: "Discuss Your Location",
    },
    cards: [
      { title: "Airports & Transportation", text: "Service for travelers at all hours, in compact spaces.", image: "/images/place-7.webp" },
      { title: "Shopping Centers & Retail", text: "An attraction that also serves, in high-footfall areas.", image: "/images/sol-venues.webp" },
      { title: "Hotels & Hospitality", text: "Guest amenities without adding a staffed counter.", image: "/images/place-10.webp" },
      { title: "Universities & Campuses", text: "Quick service between classes, for long opening hours.", image: "" },
      { title: "Corporate Environments", text: "An on-site amenity for employees and visitors.", image: "/images/place-9.webp" },
      { title: "Entertainment & Attractions", text: "Part of the experience at parks, cinemas and venues.", image: "/images/place-park.webp" },
      { title: "Healthcare & Institutional", text: "Reliable service for staff and visitors.", image: "" },
    ],
    note: "Examples are illustrative. Suitability is assessed for each location, product and market.",
  },

  /* ----------------------------- CONNECT ----------------------------- */
  connect: {
    metaTitle: "X&Y3 Connect",
    metaDesc: "X&Y3 Connect: one customer platform for machines, alerts, support, parts and technical resources.",
    hero: {
      eyebrow: "X&Y3 Connect",
      title: "Your Robotic Operation. Connected.",
      text: "One customer platform for your machines, alerts, service requests, parts and technical resources.",
      tagline: "One machine or one hundred. Know what's happening.",
      cta: "Talk to Us About Connect",
    },
    status: "X&Y3 Connect is in development. Features will be released in phases.",
    modulesTitle: "What Connect brings together",
    modules: [
      ["Fleet Management", "Your machines and locations in one place.", "planned"],
      ["Machine Health", "A simple status for every machine: Operational, Attention Required or Service Required.", "planned"],
      ["Sales & Performance", "Sales data, where the machine's data integration supports it.", "integration"],
      ["Inventory", "Consumables and product visibility, where supported.", "integration"],
      ["Alerts & Errors", "Machine notifications and technical information.", "integration"],
      ["Support", "Create and track service requests.", "planned"],
      ["Parts", "Identify and request spare parts.", "planned"],
      ["Knowledge Center", "Manuals, repair videos and training.", "planned"],
      ["Service History", "A maintenance and support record for each machine.", "planned"],
    ] as [string, string, "planned" | "integration"][],
    badges: { planned: "Planned", integration: "Depends on integration" },
    dashboard: {
      nav: ["Dashboard", "My Machines", "Sales", "Inventory", "Alerts", "Service", "Parts", "Training", "Documents", "Account"],
      fleet: "Fleet status",
      statuses: [["Operational", "12"], ["Attention Required", "2"], ["Service Required", "1"]],
      cards: [["Open service requests", "3"], ["Active alerts", "4"], ["Inventory warnings", "2"]],
      activityTitle: "Recent activity",
      activity: [
        ["Service request updated", "Site A · Unit 02"],
        ["Low consumables warning", "Site C · Unit 01"],
        ["Training video added", "Knowledge Center"],
      ],
      sample: "Sample data",
    },
    architecture: {
      title: "Built to work across manufacturers",
      text: "Connect is designed as a separate, secure application so that data from different manufacturers can be integrated over time, with accounts, roles and permissions for each customer organization.",
    },
  },

  /* ----------------------------- SUPPORT ----------------------------- */
  support: {
    metaTitle: "Support",
    metaDesc: "Technical support, spare parts, machine issues, documentation and training from X&Y3.",
    hero: {
      eyebrow: "Support",
      title: "We're Here When You Need Us.",
      text: "Technology doesn't stop at installation. Neither does X&Y3.",
    },
    actions: [
      { label: "Technical Support", category: "Technical support", icon: "wrench" },
      { label: "Spare Parts", category: "Spare parts", icon: "box" },
      { label: "Machine Issue", category: "Machine issue", icon: "alert" },
      { label: "Documentation", category: "Documentation", icon: "doc" },
      { label: "Training", category: "Training", icon: "cap" },
    ],
    formTitle: "Open a support request",
    formText: "Give us as much detail as you can. You'll receive a reference number to track your request.",
    knowledge: {
      title: "Knowledge Center",
      text: "Technical material for customers. Some resources will require a customer login.",
      items: ["Manuals & Guides", "Training Videos", "Troubleshooting", "Parts Information", "FAQs"],
      soon: "Coming soon",
    },
  },

  /* ------------------------------ ABOUT ------------------------------ */
  about: {
    metaTitle: "About",
    metaDesc: "X&Y3 was born from hands-on experience deploying and supporting automated foodservice technology.",
    hero: {
      eyebrow: "Built from experience",
      title: "Built From Experience. Designed for What Comes Next.",
    },
    story: [
      "X&Y3 was born from years of hands-on experience deploying and supporting automated foodservice technology. From logistics and installation to commissioning, training, software integration and after-sales support, we learned that the success of robotic technology depends on much more than the machine itself.",
      "X&Y3 brings that experience to international markets, connecting advanced robotic technology with the operational expertise, technical infrastructure and ongoing support businesses need to succeed.",
    ],
    statement: "We Don't Manufacture Robots. We Make Robotics Work.",
    pillarsTitle: "Four pillars",
    pillars: [
      ["Robotic Solutions", "We identify and supply appropriate robotic systems from qualified manufacturers."],
      ["Deployment", "International logistics, site planning, installation and commissioning."],
      ["Technical Ecosystem", "Machine visibility, documentation, alerts, training resources and service workflow."],
      ["Lifetime Support", "Training, technical support, spare parts, preventive maintenance and after-sales."],
    ],
    name: {
      eyebrow: "The name",
      title: "X, Y and the third dimension.",
      text: "X and Y speak to movement, direction, positioning and automation. The 3 is the dimension beyond the machine, which in our story means three things working together.",
      parts: ["Technology", "Deployment", "Support"],
    },
    cta: "Start a Project",
  },

  /* -------------------------- START A PROJECT -------------------------- */
  project: {
    metaTitle: "Start a Project",
    metaDesc: "Tell X&Y3 about your robotic project. We'll help determine the technology, deployment and support structure it requires.",
    hero: {
      eyebrow: "Start a project",
      title: "Have a Robotic Project in Mind?",
      text: "Tell us what you're looking to accomplish. We'll help determine the technology, deployment and support structure your project requires.",
    },
    intentLabel: "What would you like to do?",
    intents: ["Purchase a Robotic Solution", "Become a Distributor or Partner", "Deploy a Project", "Installation & Commissioning", "Technical Support", "Spare Parts", "Other"],
    aside: {
      title: "What happens next",
      steps: ["We review your project details.", "We contact you to understand the site and goals.", "We outline the technology, deployment and support your project requires."],
      supportTitle: "Already a customer?",
      supportText: "For an issue with an installed machine, use the support form so it is tracked.",
      supportCta: "Go to Support",
    },
  },

  /* ----------------------------- PARTNER ----------------------------- */
  partner: {
    metaTitle: "Partner With X&Y3",
    metaDesc: "X&Y3 is building its international partner network of commercial and technical partners.",
    hero: {
      eyebrow: "Partner with X&Y3",
      title: "Grow Robotics in Your Market.",
      text: "X&Y3 is building its international partner network. If you know your market and want to bring robotic solutions to it, we'd like to talk.",
    },
    types: [
      { title: "Commercial Partners", text: "Distributors, market representatives and project developers who want to offer robotic solutions with deployment and support behind them." },
      { title: "Technical Partners", text: "Qualified regional technicians and service organizations interested in installation, maintenance and support work." },
    ],
    formTitle: "Partner inquiry",
    formText: "Tell us about your company and your market.",
  },

  /* ----------------------------- CONTACT ----------------------------- */
  contact: {
    metaTitle: "Contact",
    metaDesc: "Contact X&Y3 for general enquiries, sales and projects, technical support and partnerships.",
    hero: { eyebrow: "Contact", title: "Get in Touch.", text: "Choose the route that fits your enquiry so it reaches the right people." },
    cards: [
      { title: "Sales & Projects", text: "Planning or expanding a robotic project.", cta: "Start a Project", path: "/start-a-project", emailKey: "sales" },
      { title: "Technical Support", text: "An issue, parts or training for an installed machine.", cta: "Open a Support Request", path: "/support#request", emailKey: "support" },
      { title: "Partnerships", text: "Commercial and technical partners.", cta: "Partner With X&Y3", path: "/partner", emailKey: "sales" },
      { title: "General Enquiries", text: "Anything else.", cta: "", path: "", emailKey: "info" },
    ],
    emailNote: "Email addresses are planned and will be activated with the company domain.",
  },

  /* ------------------------------ FORMS ------------------------------ */
  form: {
    required: "Required",
    optional: "optional",
    select: "Select…",
    consent: "I agree that X&Y3 may store and use these details to respond to my request.",
    privacy: "Privacy",
    sending: "Sending…",
    errorTitle: "Your request wasn't sent.",
    network: "There was a network problem. Check your connection and try again.",
    again: "Send another request",
    upload: {
      hint: "Up to 3 files, 4 MB in total. JPG, PNG, WebP, PDF or MP4.",
      tooMany: "Please attach at most 3 files.",
      tooBig: "The files are larger than 4 MB in total.",
      badType: "Only JPG, PNG, WebP, PDF and MP4 files can be attached.",
    },
    demo: "Demo mode: this request was not delivered because email is not configured on this deployment.",
    project: {
      submit: "Start the Conversation",
      okTitle: "Thank you. Your project details are in.",
      okText: "We'll review them and contact you using the details you provided.",
      fields: {
        name: "Name", company: "Company", country: "Country", email: "Email", phone: "Phone / WhatsApp",
        industry: "Industry", solution: "Solution of interest", machines: "Expected number of machines",
        stage: "Project stage", timeline: "Target timeline", description: "Project description",
        files: "Location photos or project documents",
      },
      options: {
        industry: ["Airports & Transportation", "Shopping Centers & Retail", "Hotels & Hospitality", "Universities & Campuses", "Corporate Environments", "Entertainment & Attractions", "Healthcare & Institutional", "Other"],
        solution: ["Frozen Dessert Robotics", "Br3wBot Coffee Robotics", "Emerging Robotic Solutions", "Not sure yet"],
        machines: ["1", "2–5", "6–20", "More than 20", "Not sure yet"],
        stage: ["Exploring", "Planning", "Budget approved", "Ready to deploy"],
        timeline: ["Within 3 months", "3–6 months", "6–12 months", "More than 12 months", "Not decided"],
      },
    },
    support: {
      submit: "Submit Support Request",
      okTitle: "Your support request has been received.",
      okText: "Keep this reference number. Quote it in any follow-up about this request.",
      reference: "Reference",
      fields: {
        company: "Company name", name: "Contact name", email: "Email", phone: "Phone / WhatsApp", country: "Country",
        site: "Site / location name", product: "Machine / product", model: "Model", serial: "Serial number",
        category: "Issue category", urgency: "Urgency", description: "Description", files: "Photos or video of the issue",
        contactMethod: "Preferred contact method",
      },
      options: {
        product: ["Frozen dessert robot", "Br3wBot", "Other"],
        category: ["Technical support", "Machine issue", "Spare parts", "Documentation", "Training", "Other"],
        urgency: ["Machine not operating", "Operating with a problem", "Routine question"],
        contactMethod: ["Email", "Phone", "WhatsApp"],
      },
    },
    partner: {
      submit: "Send Partner Inquiry",
      okTitle: "Thank you. Your inquiry is in.",
      okText: "We'll review it and contact you using the details you provided.",
      fields: {
        country: "Country", company: "Company", website: "Website", name: "Contact name", email: "Email",
        partnerType: "Partner type", industries: "Current industries", capability: "Technical capability",
        coverage: "Geographic coverage", teamSize: "Team size", brands: "Relevant brands you represent or service", message: "Message",
      },
      options: {
        partnerType: ["Commercial partner", "Technical partner", "Both"],
        teamSize: ["1–5", "6–20", "21–50", "More than 50"],
      },
    },
  },

  legal: {
    privacy: "Privacy",
    terms: "Terms",
    pending: "This page is pending legal review and will be published before launch.",
  },
  notFound: {
    title: "This page doesn't exist.",
    text: "The page may have moved, or the address may be mistyped.",
    home: "Go to the homepage",
    solutions: "Explore Solutions",
  },
};

export default en;
export type Content = typeof en;
