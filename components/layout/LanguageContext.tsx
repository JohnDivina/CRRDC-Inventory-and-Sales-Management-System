"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "fil";

export const translations = {
  en: {
    // Header & Navigation
    home: "Home",
    catalog: "Products",
    cart: "Shopping Cart",
    adminLogin: "Admin Login",
    adminDashboard: "Admin Dashboard",
    tagline: "Research Innovation and Extension",

    // Category Filter Labels
    allProducts: "All Products",
    seeds: "Seeds",
    rice: "Rice",
    otherProducts: "Other Products",
    searchPlaceholder: "Search products...",
    inStock: "in stock",
    outOfStock: "Out of Stock",
    addToCart: "Add",
    addedToCart: "Added",

    // Unit Labels
    perKg: "per kg",
    perSack: "per sack (25 kg)",
    perPacket: "per packet",
    perUnit: "per unit",

    // Landing Page Mandate
    mandateEyebrow: "Established under CLSU",
    mandateHeading: "Research Innovation and Extension",
    mandateBody1:
      "The Crops and Resources Research and Development Center (CRRDC) is the flagship research and production center of Central Luzon State University responsible for the development, maintenance, and distribution of certified planting materials — seeds, rice, and other agricultural products — to farmers, cooperatives, and the general public across the Philippines.",
    mandateBody2:
      "Our products are grown, processed, and certified by CLSU researchers following Bureau of Plant Industry standards. When you purchase from CRRDC, you receive materials backed by decades of applied agricultural science at one of the country's leading state universities.",
    yearsResearch: "Years of Research",
    bpiCertified: "Certified Products",
    clsuUni: "State University",
    shopCatalog: "Shop Catalog",

    // Categories Section
    whatWeDistribute: "What we distribute",
    seedDesc:
      "Certified foundation and registered seeds developed by CLSU researchers.",
    riceDesc:
      "Milled rice from CRRDC's own varieties — sold per kilogram or 25-kg sack.",
    otherDesc:
      "Organic inputs, bio-fertilizers, and other CRRDC agricultural products.",

    // How to Purchase (4 Stages)
    howToPurchaseTitle: "Four stages, from catalog to farm harvest.",
    purchaseIntro:
      "CRRDC operates an in-person payment system. Browse and select your certified products online, then present your generated order QR code at the center.",
    stage1Label: "1.0 · BROWSE · ONLINE CATALOG",
    stage1Title: "Explore certified seeds, rice & inputs",
    stage1Desc:
      "Filter through BPI-certified foundation and registered seeds, high-yield milled rice varieties, and organic farm technology inputs developed directly by CLSU researchers.",
    stage1Chip1: "Online Access",
    stage1Chip2: "No Login Required",

    stage2Label: "2.0 · SELECT · CART & QUANTITY",
    stage2Title: "Choose flexible units per kg or 25-kg sack",
    stage2Desc:
      "Rice is available loose per kilogram or transacted as full 25-kg sacks. Seeds are packaged per certified packet. Adjust your quantities easily right from the product card.",
    stage2Chip1: "Kilogram & Sack Breakdown",
    stage2Chip2: "Live Subtotal",

    stage3Label: "3.0 · CHECKOUT · INSTANT QR GENERATION",
    stage3Title: "Generate your official transaction QR code",
    stage3Desc:
      "Review your order summary and proceed to checkout. The platform generates an instant high-resolution QR code representing your exact order ID and total amount due.",
    stage3Chip1: "Instant QR Code",
    stage3Chip2: "Download & Screenshot Ready",

    stage4Label: "4.0 · PAY & COLLECT · CASHIER SCAN",
    stage4Title: "Scan at CRRDC office & claim your products",
    stage4Desc:
      "Bring your QR code to the CRRDC main office at CLSU. Our staff scans the QR code on our admin scanner portal to instantly confirm your payment and release your certified items.",
    stage4Chip1: "CLSU Main Campus",
    stage4Chip2: "Instant Scanner Verification",

    // Honest Math Band
    honestPerformance: "Honest Performance",
    honestHeading: "Direct access to CLSU research outputs.",
    stat1Desc:
      "Certified foundation and registered inbred seeds developed by CLSU experts.",
    stat2Desc:
      "Average QR verification and payment confirmation time at cashier counter.",
    stat3Desc:
      "Uncomplicated stages from digital catalog browsing to product release.",

    // Closer
    closerTitle: "Start at stage one.",
    closerLede:
      "Explore certified seed varieties, high-grade milled rice, and organic agricultural inputs today.",
    browseBtn: "Browse Catalog",

    // Product Detail Page
    backToCatalog: "Back to Catalog",
    backToHome: "Back to Home",
    productDetailsTitle: "Product Overview & Specification",
    specifications: "Specifications",
    categoryLabel: "Category",
    unitTypeLabel: "Unit Unit / Packaging",
    availableStock: "Available Stock",
    itemTotal: "Item Total",

    // Cart Page
    cartTitle: "Shopping Cart",
    emptyCartHeading: "Your shopping cart is empty",
    emptyCartSub:
      "Browse our certified seed and agricultural products to add items to your order.",
    cartItems: "Cart Items",
    quantity: "Quantity",
    price: "Price",
    remove: "Remove",
    clearCart: "Clear Cart",
    subtotalVal: "Subtotal",
    proceedCheckout: "Proceed to Checkout",

    // Checkout Page
    checkoutHeader: "Order Checkout",
    checkoutSub: "Fill in your details below to generate your official transaction QR code.",
    customerInfo: "Customer Details",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNum: "Contact Number",
    orderSummary: "Order Summary",
    totalAmount: "Total Amount Due",
    confirmGenerateQr: "Confirm Order & Generate QR Code",
    generatingQr: "Generating QR Code...",

    // Order Confirmation QR Page
    orderConfirmedTitle: "Order Confirmed!",
    orderConfirmedSub: "Your transaction QR code is ready.",
    qrInstructions:
      "Present this QR code to the CRRDC administrator upon in-person payment to complete your transaction.",
    saveQrBtn: "Download QR Image",
    cancelOrderBtn: "Cancel Order",
    paymentLocationTitle: "Payment & Collection Point",
    crrdcOfficeAddress:
      "CRRDC Main Office, CLSU Main Campus, Science City of Muñoz, Nueva Ecija",
    orderStatusLabel: "Status",
    statusPending: "Pending Payment",

    // Footer & Location
    institution: "Crops and Resources Research and Development Center",
    university:
      "Central Luzon State University · Science City of Muñoz, Nueva Ecija",
    contact: "Contact",
    location: "Science City of Muñoz, Nueva Ecija, Philippines",
    center: "Center",
    aboutCrrdc: "About CRRDC",
    clsuWebsite: "CLSU Website",
    mandateStatement:
      "A state university committed to excellence in science and agriculture.",

    // Map Location & Contact Form
    locationTitle: "Location & Map",
    locationHeading: "Visit Us at CLSU RET Complex",
    locationSub: "Crops and Resources Research and Development Center (CRRDC), RET Complex, Central Luzon State University, Science City of Muñoz, Nueva Ecija.",
    getDirections: "Get Directions",
    contactTitle: "Contact Us & Feedback",
    contactSub: "Have questions about seed availability or want to share feedback? Send us a message directly to crrdc@clsu.edu.ph.",
    yourName: "Your Name",
    yourEmail: "Email Address",
    subject: "Subject / Topic",
    message: "Message / Feedback",
    sendFeedback: "Send Message",
    sending: "Sending...",
    feedbackSuccess: "Thank you! Your message has been sent to crrdc@clsu.edu.ph.",
    returnToHome: "Return to Home",
  },
  fil: {
    // Header & Navigation
    home: "Tahanan",
    catalog: "Mga Produkto",
    cart: "Kart ng Pagbili",
    adminLogin: "Mag-login sa Admin",
    adminDashboard: "Dashboard ng Admin",
    tagline: "Pananaliksik, Inobasyon at Ekstensyon",

    // Category Filter Labels
    allProducts: "Lahat ng Produkto",
    seeds: "Mga Binhi",
    rice: "Bigas",
    otherProducts: "Iba pang Produkto",
    searchPlaceholder: "Maghanap ng produkto...",
    inStock: "na stock",
    outOfStock: "Ubos na ang Stock",
    addToCart: "Idagdag",
    addedToCart: "Naidagdag na",

    // Unit Labels
    perKg: "kada kilo",
    perSack: "kada kaban (25 kg)",
    perPacket: "kada balot",
    perUnit: "kada piraso",

    // Landing Page Mandate
    mandateEyebrow: "Itinatag sa ilalim ng CLSU",
    mandateHeading: "Pananaliksik, Inobasyon at Ekstensyon",
    mandateBody1:
      "Ang Crops and Resources Research and Development Center (CRRDC) ay ang pangunahing sentro ng pananaliksik at produksyon ng Central Luzon State University na responsable sa pagbuo, pagpapanatili, at pamamahagi ng mga sertipikadong binhi, bigas, at iba pang produktong agrikultural para sa mga magsasaka at mamamayan sa buong Pilipinas.",
    mandateBody2:
      "Ang aming mga produkto ay pinatutubo, pinoproseso, at sinisertipikahan ng mga mananaliksik ng CLSU ayon sa pamantayan ng Bureau of Plant Industry (BPI). Pag bumili ka sa CRRDC, nakatatanggap ka ng mga materyales na sinusuportahan ng dekada ng agham pang-agrikultura sa isa sa mga nangungunang unibersidad sa bansa.",
    yearsResearch: "Taon ng Pananaliksik",
    bpiCertified: "Sertipikadong Produkto",
    clsuUni: "Pambansang Unibersidad",
    shopCatalog: "Tingnan ang Katalogo",

    // Categories Section
    whatWeDistribute: "Mga Produktong Inilalaan",
    seedDesc:
      "Mga sertipikadong binhi na binuo ng mga mananaliksik ng CLSU.",
    riceDesc:
      "Mataas na kalidad na bigas mula sa mga bukid ng CRRDC — per kilo o per 25-kg na kaban.",
    otherDesc:
      "Mga organikong pataba, bio-fertilizers, at iba pang produktong agrikultural ng CRRDC.",

    // How to Purchase (4 Stages)
    howToPurchaseTitle: "Apat na hakbang, mula katalogo hanggang sa pagkuha ng ani.",
    purchaseIntro:
      "Ang CRRDC ay gumagamit ng direktang pagbabayad sa opisina. Pumili ng mga produkto online, at ipakita ang inyong QR code sa sentro para magbayad.",
    stage1Label: "1.0 · TINGNAN · ONLINE KATALOGO",
    stage1Title: "Galugarin ang mga sertipikadong binhi, bigas at pataba",
    stage1Desc:
      "Pumili mula sa mga sertipikadong binhi mula sa BPI, mataas na uri ng bigas, at mga organikong pataba na binuo ng mga siyentipiko ng CLSU.",
    stage1Chip1: "Online na Akses",
    stage1Chip2: "Walang Kailangang Login",

    stage2Label: "2.0 · PUMILI · KART AT DAMI",
    stage2Title: "Pumili ng sukat kada kilo o kada 25-kg na kaban",
    stage2Desc:
      "Ang bigas ay mabibili kada kilo o per 25-kg na kaban. Ang mga binhi ay nakapakete kada sertipikadong balot. Madaling baguhin ang dami sa bawat card.",
    stage2Chip1: "Paliwanag sa Kilo at Kaban",
    stage2Chip2: "Aktwal na Subtotal",

    stage3Label: "3.0 · PAGTUTUOS · GUMAWA NG QR CODE",
    stage3Title: "Kumuha ng opisyal na QR Code ng inyong transaksyon",
    stage3Desc:
      "Suriin ang buod ng inyong order at magpatuloy sa checkout. Agad na gagawa ang system ng QR code na naglalaman ng inyong Order ID at halaga.",
    stage3Chip1: "Instant na QR Code",
    stage3Chip2: "Handang I-download at I-screenshot",

    stage4Label: "4.0 · BAYAD AT KUHA · SCAN SA CASHIER",
    stage4Title: "I-scan sa opisina ng CRRDC at kuhanin ang mga produkto",
    stage4Desc:
      "Dalhin ang inyong QR code sa pangunahing opisina ng CRRDC sa CLSU. I-s-scan ng aming staff ang QR code upang kumpirmahin ang bayad at ibigay ang inyong mga binili.",
    stage4Chip1: "CLSU Main Campus",
    stage4Chip2: "Mabilis na Pagpapatunay sa Scanner",

    // Honest Math Band
    honestPerformance: "Tapat na Paglilingkod",
    honestHeading: "Direktang akses sa mga resulta ng pananaliksik ng CLSU.",
    stat1Desc:
      "Sertipikadong mga binhi na binuo ng mga eksperto ng CLSU.",
    stat2Desc:
      "Grapikong oras ng pag-kumpirma sa QR code sa cashier counter.",
    stat3Desc:
      "Apat na simpleng hakbang mula online catalog hanggang sa pagkuha.",

    // Closer
    closerTitle: "Magsimula sa unang hakbang.",
    closerLede:
      "Galugarin ang mga sertipikadong binhi, mataas na kalidad ng bigas, at mga produktong agrikultural ngayon.",
    browseBtn: "Tingnan ang Katalogo",

    // Product Detail Page
    backToCatalog: "Bumalik sa Katalogo",
    backToHome: "Bumalik sa Tahanan",
    productDetailsTitle: "Pangkalahatang Tanawin at Detalye ng Produkto",
    specifications: "Mga Detalye",
    categoryLabel: "Kategorya",
    unitTypeLabel: "Uri ng Sukat / Pakete",
    availableStock: "Bakanteng Stock",
    itemTotal: "Kabuuan ng Item",

    // Cart Page
    cartTitle: "Kart ng Pagbili",
    emptyCartHeading: "Walang laman ang inyong kart ng pagbili",
    emptyCartSub:
      "Tingnan ang aming mga sertipikadong binhi at produktong agrikultural upang magdagdag ng mga item sa inyong order.",
    cartItems: "Mga Item sa Kart",
    quantity: "Dami",
    price: "Presyo",
    remove: "Alisin",
    clearCart: "Alisin Lahat",
    subtotalVal: "Subtotal",
    proceedCheckout: "Magpatuloy sa Pagtutuos (Checkout)",

    // Checkout Page
    checkoutHeader: "Pagtutuos ng Order (Checkout)",
    checkoutSub: "Ilagay ang inyong detalye sa ibaba upang gumawa ng opisyal na QR Code ng transaksyon.",
    customerInfo: "Impormasyon ng Mamimili",
    fullName: "Buong Pangalan",
    emailAddress: "Email Address",
    phoneNum: "Numero ng Telepono",
    orderSummary: "Buod ng Order",
    totalAmount: "Kabuuan na Babayaran",
    confirmGenerateQr: "Kumpirmahin ang Order at Gumawa ng QR Code",
    generatingQr: "Ginagawa ang QR Code...",

    // Order Confirmation QR Page
    orderConfirmedTitle: "Kumpirmado na ang Order!",
    orderConfirmedSub: "Handa na ang inyong QR Code ng transaksyon.",
    qrInstructions:
      "Ipakita ang QR Code na ito sa tagapamahala ng CRRDC sa inyong pagbabayad sa opisina upang kumpletuhin ang transaksyon.",
    saveQrBtn: "I-download ang Larawan ng QR",
    cancelOrderBtn: "Kanselahin ang Order",
    paymentLocationTitle: "Lugar ng Bayaran at Pagkuha",
    crrdcOfficeAddress:
      "Pangunahing Opisina ng CRRDC, CLSU Main Campus, Science City of Muñoz, Nueva Ecija",
    orderStatusLabel: "Kalagayan",
    statusPending: "Naghihintay ng Bayad",

    // Footer
    institution: "Crops and Resources Research and Development Center",
    university:
      "Central Luzon State University · Science City of Muñoz, Nueva Ecija",
    contact: "Makipag-ugnayan",
    location: "Science City of Muñoz, Nueva Ecija, Pilipinas",
    center: "Sentro",
    aboutCrrdc: "Tungkol sa CRRDC",
    clsuWebsite: "Website ng CLSU",
    mandateStatement:
      "Pambansang unibersidad na nakatuon sa kahusayan sa agham at agrikultura.",

    // Map Location & Contact Form
    locationTitle: "Lokasyon at Mapa",
    locationHeading: "Bisitahin Kami sa CLSU RET Complex",
    locationSub: "Crops and Resources Research and Development Center (CRRDC), RET Complex, Central Luzon State University, Lungsod Agham ng Muñoz, Nueva Ecija.",
    getDirections: "Kumuha ng Direksyon",
    contactTitle: "Makipag-ugnayan at Magbigay ng Puna",
    contactSub: "May mga katanungan tungkol sa mga binhi o gustong magbigay ng puna? Magpadala ng mensahe sa crrdc@clsu.edu.ph.",
    yourName: "Inyong Pangalan",
    yourEmail: "Email Address",
    subject: "Paksa / Topic",
    message: "Mensahe / Puna",
    sendFeedback: "Ipadala ang Mensahe",
    sending: "Ipinapadala...",
    feedbackSuccess: "Maraming salamat! Ang inyong mensahe ay naipadala na sa crrdc@clsu.edu.ph.",
    returnToHome: "Bumalik sa Home",
  },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations["en"]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("crrdc-lang") as Language | null;
    if (saved && (saved === "en" || saved === "fil")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem("crrdc-lang", newLang);
  };

  const t = (key: keyof typeof translations["en"]): string => {
    return translations[language][key] || translations["en"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
