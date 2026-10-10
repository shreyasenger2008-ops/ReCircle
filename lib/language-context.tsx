"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { speakText, stopSpeaking } from "@/lib/voice-assistant";
import { toast } from "sonner";

export type Language = "hi" | "en" | "kn";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  speak: (text: string) => void;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  hi: {
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.nearby": "नजदीकी पिकअप रडार",
    "nav.route": "स्मार्ट रूट व ढलान",
    "nav.karma": "कचरा कर्मा क्रेडिट",
    "nav.health": "सुरक्षा कवच (हेल्थ फंड)",
    "nav.benefits": "कल्याण व लाभ (Benefits)",
    "nav.myjobs": "मेरे सक्रिय काम",
    "nav.earnings": "कमाई और वॉलेट",
    "nav.wallet": "कमाई और UPI वॉलेट",
    "nav.profile": "मेरी प्रोफाइल व आईडी",
    "nav.help": "सुरक्षा व सहायता",
    "nav.schedule": "पिकअप शेड्यूल करें",
    "nav.mypickups": "मेरे पिकअप",
    "nav.leaderboard": "ग्रीन लीडरबोर्ड",
    "nav.priceboard": "फेयर भाव बोर्ड",
    "nav.impact": "पर्यावरण प्रभाव",
    "nav.payments": "भुगतान व रसीदें",
    "nav.logout": "लॉगआउट / रोल बदलें",
    "nav.users": "उपयोगकर्ता और सत्यापन",
    "nav.pickups": "पिकअप और डिस्पैच",
    "nav.fairness": "समानता विश्लेषण",
    "nav.disputes": "शिकायत निवारण",
    "nav.settings": "प्लेटफ़ॉर्म सेटिंग्स",

    // Bottom Navigation
    "tab.home": "होम",
    "tab.jobs": "काम",
    "tab.wallet": "वॉलेट",
    "tab.benefits": "लाभ",
    "tab.profile": "प्रोफाइल",

    // Dashboard
    "dash.greeting": "नमस्ते",
    "dash.subtitle": "यहाँ आपकी दैनिक कमाई और आज के रूट का विवरण है।",
    "dash.nextPickupTitle": "आपका अगला पिकअप",
    "dash.startNavigation": "नेविगेट करें / रास्ते में निकलें",
    "dash.markArrived": "कचरा एकत्र करें व वजन करें",
    "dash.online": "ऑनलाइन व सक्रिय",
    "dash.busy": "व्यस्त",
    "dash.todayEarnings": "आज की कमाई",
    "dash.weeklyEarnings": "साप्ताहिक कमाई",
    "dash.pendingPayouts": "बकाया भुगतान",
    "dash.jobsCompleted": "पूरे किए गए काम",
    "dash.goal": "लक्ष्य: ₹800",
    "dash.routeSummary": "सुझाया गया डाउनहिल रूट",
    "dash.routeSubtitle": "कम मेहनत में ज्यादा कमाई के लिए इन पिकअप को क्रम से पूरा करें।",
    "dash.opportunityScore": "फेयर अवसर स्कोर",
    "dash.opportunityDesc": "आज आपकी कमाई संतुलित रखने के लिए एल्गोरिदम आपको नजदीकी हाई-वैल्यू पिकअप प्राथमिकता से दे रहा है!",
    "dash.acceptedPickups": "आपके स्वीकार किए गए काम",
    "dash.markCompleted": "काम पूरा करें",
    "dash.expectedPayout": "पक्की कमाई",
    "dash.recommendedNearby": "नजदीकी नए पिकअप",
    "dash.viewMap": "नक्शा देखें",
    "dash.viewList": "सूची देखें",
    "dash.accept": "स्वीकार करें",
    "dash.noJobs": "फिलहाल कोई सक्रिय पिकअप नहीं है। नजदीकी रडार से नए काम स्वीकार करें।",

    // Nearby Radar
    "radar.title": "नजदीकी पिकअप रडार",
    "radar.subtitle": "आपके आस-पास उपलब्ध रीसाइक्लिंग अनुरोध (दूरी के अनुसार)।",
    "radar.filterTitle": "रडार फिल्टर",
    "radar.category": "कचरे का प्रकार",
    "radar.maxDistance": "अधिकतम दूरी",
    "radar.minPayout": "न्यूनतम गारंटीकृत राशि (₹)",
    "radar.urgency": "प्राथमिकता",
    "radar.allRecyclables": "सभी प्रकार (All)",
    "radar.plastic": "प्लास्टिक",
    "radar.cardboard": "गत्ता व कागज़",
    "radar.metal": "लोहा व धातु",
    "radar.ewaste": "ई-कचरा",
    "radar.glass": "कांच",
    "radar.noRequests": "इस फिल्टर में कोई पिकअप नहीं मिला। फिल्टर बदलकर देखें।",
    "radar.acceptPickup": "पिकअप स्वीकार करें",
    "radar.accepted": "स्वीकार किया गया",
    "radar.payout": "पक्की कमाई",
    "radar.distance": "दूरी",
    "radar.estWeight": "अनुमानित वजन",
    "radar.timeSlot": "समय",
    "radar.viewRoute": "रूट मैप देखें",

    // Route & Strain
    "route.title": "पुशकार्ट ढलान व स्मार्ट रूट",
    "route.subtitle": "ढलान के अनुसार क्रमबद्ध - भारी ठेले को चढ़ाई पर ले जाने की मेहनत से बचें।",
    "route.strainIndex": "शारीरिक तनाव सूचकांक",
    "route.lowStrain": "कम तनाव (ढलान अनुकूल)",
    "route.cartCapacity": "ठेला क्षमता",
    "route.startRun": "डाउनहिल रूट शुरू करें",
    "route.optimalNotice": "💡 एल्गोरिदम ने सभी पिकअप को पहाड़ी की ढलान के क्रम में लगाया है ताकि ठेला खींचने में 45% कम मेहनत लगे।",

    // Karma Credit & Benefits
    "karma.title": "कचरा कर्मा क्रेडिट व सुरक्षा लाभ",
    "karma.subtitle": "समयबद्धता, अच्छी छंटाई और दुर्घटना बीमा सुरक्षा का एकीकृत केंद्र।",
    "karma.scoreLabel": "आपका कर्मा स्कोर",
    "karma.excellent": "उत्कृष्ट रेटिंग (ऋण योग्य)",
    "karma.microloanTitle": "आसान माइक्रोलोन सिम्युलेटर",
    "karma.loanSubtitle": "कर्मा स्कोर के आधार पर बिना गारंटी तुरंत ऋण प्राप्त करें।",
    "karma.applyLoan": "ऋण के लिए आवेदन करें",
    "karma.badges": "सफलता बैज व उपलब्धियां",
    "benefits.title": "सफाई मित्र कल्याण व लाभ",
    "benefits.subtitle": "कचरा कर्मा क्रेडिट और सुरक्षा कवच हेल्थ पूल का संयुक्त डैशबोर्ड।",

    // Health Pool
    "health.title": "सुरक्षा कवच - स्वास्थ्य एवं सुरक्षा फंड",
    "health.subtitle": "सफाई मित्रों के लिए आपातकालीन चिकित्सा सुरक्षा और उपकरण सहायता।",
    "health.poolBalance": "कुल उपलब्ध सुरक्षा फंड",
    "health.yourCoverage": "आपका वार्षिक बीमा कवरेज",
    "health.fileClaim": "नया मेडिकल क्लेम दर्ज करें",
    "health.recentClaims": "हाल के क्लेम और स्थिति",
    "health.claimModalTitle": "आपातकालीन क्लेम आवेदन",
    "health.claimSubmit": "क्लेम सबमिट करें",

    // Wallet
    "wallet.title": "कमाई विवरण व UPI वॉलेट",
    "wallet.subtitle": "आपकी मेहनत की पूरी कमाई - 100% सीधी और तुरंत आपके खाते में।",
    "wallet.balance": "वॉलेट बैलेंस",
    "wallet.withdraw": "बैंक में तुरंत ट्रांसफर करें",
    "wallet.transferSuccess": "पैसे बैंक खाते में भेज दिए गए हैं!",
    "wallet.txHistory": "लेन-देन का इतिहास",
    "wallet.directNotice": "✓ ReCircle पर कोई बिचौलिया कमीशन नहीं काटा जाता।",

    // Generator Pages
    "gen.title": "नागरिक रीसाइक्लिंग डैशबोर्ड",
    "gen.subtitle": "यहाँ आपकी रीसाइक्लिंग प्रगति और पर्यावरण प्रभाव का विवरण है।",
    "gen.scheduleTitle": "रीसाइक्लिंग पिकअप शेड्यूल करें",
    "gen.scheduleSubtitle": "घर बैठे रीसायकल करें और सफाई मित्रों को उचित मूल्य दें।",
    "gen.leaderboardTitle": "ग्रीन लीडरबोर्ड",
    "gen.leaderboardSubtitle": "शहर के शीर्ष पर्यावरण रक्षक नागरिक।",
    "gen.priceboardTitle": "फेयर फ्लोर भाव बोर्ड",
    "gen.priceboardSubtitle": "सभी रीसाइक्लिंग सामग्रियों के न्यूनतम सरकारी व नैतिक मूल्य।",
    "gen.impactTitle": "पर्यावरण प्रभाव रिपोर्ट",
    "gen.impactSubtitle": "आपके द्वारा बचाया गया कार्बन और वृक्ष।",
    "gen.paymentsTitle": "भुगतान और डिजिटल रसीदें",
    "gen.paymentsSubtitle": "सफाई मित्रों को किए गए सीधे भुगतान का ब्योरा।",

    // Common
    "voice.barTitle": "🇮🇳 बोलकर सुनें और समझें",
    "voice.barSubtitle": "किसी भी कार्ड पर 🔊 बटन दबाकर पूरी जानकारी अपनी भाषा में सुनें",
    "voice.speakBtn": "बोलें",
    "voice.listen": "सुनें",
    "voice.listening": "सुन रहे हैं...",
    "btn.accept": "स्वीकार करें",
    "btn.complete": "वजन दर्ज करें व पूरा करें",
    "btn.viewReceipt": "रसीद देखें",
    "btn.dispute": "शिकायत दर्ज करें",
    "btn.withdraw": "बैंक में ट्रांसफर करें",
    "btn.save": "सुरक्षित करें",
    "btn.cancel": "रद्द करें",
    "badge.fairFloor": "100% पक्का भाव",
    "badge.directWorker": "100% सीधी कमाई",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.nearby": "Nearby Pickup Radar",
    "nav.route": "Route & Strain Planner",
    "nav.karma": "Kachra Karma Credit",
    "nav.health": "Suraksha Health Pool",
    "nav.benefits": "Benefits & Karma",
    "nav.myjobs": "My Active Jobs",
    "nav.earnings": "Earnings & Wallet",
    "nav.wallet": "Earnings & UPI Wallet",
    "nav.profile": "Worker Profile & ID",
    "nav.help": "Safety & Guidelines",
    "nav.schedule": "Schedule Pickup",
    "nav.mypickups": "My Pickups",
    "nav.leaderboard": "Green Leaderboard",
    "nav.priceboard": "Fair Price Board",
    "nav.impact": "Impact Report",
    "nav.payments": "Payments & Receipts",
    "nav.logout": "Switch Persona / Logout",
    "nav.users": "Users & Verifications",
    "nav.pickups": "Pickups & Dispatch",
    "nav.fairness": "Fairness Analytics",
    "nav.disputes": "Dispute Arbitration",
    "nav.settings": "Platform Settings",

    // Bottom Navigation
    "tab.home": "Home",
    "tab.jobs": "Jobs",
    "tab.wallet": "Wallet",
    "tab.benefits": "Benefits",
    "tab.profile": "Profile",

    // Dashboard
    "dash.greeting": "Hello",
    "dash.subtitle": "Here is your daily income and route summary.",
    "dash.nextPickupTitle": "Your Next Pickup",
    "dash.startNavigation": "Start Navigation",
    "dash.markArrived": "Arrived & Confirm Weight",
    "dash.online": "Online & Accepting",
    "dash.busy": "Busy",
    "dash.todayEarnings": "Today's Earnings",
    "dash.weeklyEarnings": "Weekly Earnings",
    "dash.pendingPayouts": "Pending Payments",
    "dash.jobsCompleted": "Jobs Completed",
    "dash.goal": "Goal: ₹800",
    "dash.routeSummary": "Suggested Route Summary",
    "dash.routeSubtitle": "Optimize your travel by visiting these locations in downhill sequence.",
    "dash.opportunityScore": "Fair Opportunity Score",
    "dash.opportunityDesc": "Because your earnings are currently below the daily target, the ReCircle algorithm is prioritizing you for incoming high-value requests in your area!",
    "dash.acceptedPickups": "Your Accepted Pickups",
    "dash.markCompleted": "Mark as Completed",
    "dash.expectedPayout": "Expected Payout",
    "dash.recommendedNearby": "Recommended Nearby",
    "dash.viewMap": "View Map",
    "dash.viewList": "View List",
    "dash.accept": "Accept Request",
    "dash.noJobs": "No active pickups right now. Find new requests from the Nearby Radar.",

    // Nearby Radar
    "radar.title": "Nearby Pickup Radar",
    "radar.subtitle": "Real-time fair matching requests in your neighborhood.",
    "radar.filterTitle": "Filter Radar Requests",
    "radar.category": "Waste Category",
    "radar.maxDistance": "Max Radius (km)",
    "radar.minPayout": "Min Guaranteed Payout (₹)",
    "radar.urgency": "Urgency",
    "radar.allRecyclables": "All Recyclables",
    "radar.plastic": "Plastic",
    "radar.cardboard": "Cardboard & Paper",
    "radar.metal": "Metal & Scrap",
    "radar.ewaste": "E-Waste",
    "radar.glass": "Glass",
    "radar.noRequests": "No pending requests match your filter. Try adjusting distance or category.",
    "radar.acceptPickup": "Accept Pickup",
    "radar.accepted": "Accepted",
    "radar.payout": "Guaranteed Payout",
    "radar.distance": "Distance",
    "radar.estWeight": "Est. Weight",
    "radar.timeSlot": "Time Slot",
    "radar.viewRoute": "View Route Map",

    // Route & Strain
    "route.title": "Pushcart Elevation & Route Planner",
    "route.subtitle": "Downhill-optimized route stops to minimize heavy cart physical strain.",
    "route.strainIndex": "Physical Strain Index",
    "route.lowStrain": "Low Strain (Downhill Optimized)",
    "route.cartCapacity": "Cart Payload Capacity",
    "route.startRun": "Start Downhill Route",
    "route.optimalNotice": "💡 ReCircle orders all stops downhill so you avoid pushing heavy 100kg carts uphill.",

    // Karma Credit & Benefits
    "karma.title": "Kachra Karma Credit & Benefits",
    "karma.subtitle": "Alternative credit rating proving reliability through punctual collections.",
    "karma.scoreLabel": "Your Karma Score",
    "karma.excellent": "Excellent Credit Tier (Eligible for Loans)",
    "karma.microloanTitle": "Instant Microloan Simulator",
    "karma.loanSubtitle": "Collateral-free credit powered by your verified recycling karma score.",
    "karma.applyLoan": "Apply for Microloan",
    "karma.badges": "Achievement Badges",
    "benefits.title": "Worker Benefits & Welfare",
    "benefits.subtitle": "Unified portal for Karma Credit scoring and Suraksha Health Pool.",

    // Health Pool
    "health.title": "Suraksha Kawach - Health & Safety Pool",
    "health.subtitle": "Community-funded micro-insurance for waste-pickers and family emergencies.",
    "health.poolBalance": "Total Available Pool Fund",
    "health.yourCoverage": "Your Annual Healthcare Cover",
    "health.fileClaim": "File Medical Claim",
    "health.recentClaims": "Recent Claims & Status",
    "health.claimModalTitle": "Emergency Claim Application",
    "health.claimSubmit": "Submit Claim for Instant Payout",

    // Wallet
    "wallet.title": "Earnings & UPI Wallet",
    "wallet.subtitle": "Your verified earnings — 100% direct and instant to your bank account.",
    "wallet.balance": "Wallet Balance",
    "wallet.withdraw": "Instant Bank Withdrawal",
    "wallet.transferSuccess": "Funds transferred successfully to your bank account!",
    "wallet.txHistory": "Transaction History",
    "wallet.directNotice": "✓ Zero middleman commission. 100% goes directly to the worker.",

    // Generator Pages
    "gen.title": "Citizen Recycling Dashboard",
    "gen.subtitle": "Track your circular economy impact, schedule pickups, and earn green points.",
    "gen.scheduleTitle": "Schedule a Fair Recycling Pickup",
    "gen.scheduleSubtitle": "Book doorstep scrap collection and ensure fair direct payment to pickers.",
    "gen.leaderboardTitle": "Green Leaderboard",
    "gen.leaderboardSubtitle": "Top ethical recyclers in your neighborhood.",
    "gen.priceboardTitle": "Fair Floor Price Board",
    "gen.priceboardSubtitle": "Transparent benchmark prices per kg for all recyclable materials.",
    "gen.impactTitle": "ESG Environmental Impact Report",
    "gen.impactSubtitle": "Verified carbon offset and landfill diversion metrics.",
    "gen.paymentsTitle": "Payments & Receipts",
    "gen.paymentsSubtitle": "Transparent invoices showing direct worker remuneration.",

    // Common
    "voice.barTitle": "🇮🇳 Vernacular Voice & Audio Assistant",
    "voice.barSubtitle": "Tap the 🔊 icon on any pickup card to listen to details in your language",
    "voice.speakBtn": "Speak",
    "voice.listen": "Listen",
    "voice.listening": "Listening...",
    "btn.accept": "Accept Pickup",
    "btn.complete": "Confirm Weight & Finish",
    "btn.viewReceipt": "View Receipt",
    "btn.dispute": "Raise Dispute",
    "btn.withdraw": "Instant Withdrawal",
    "btn.save": "Save Changes",
    "btn.cancel": "Cancel",
    "badge.fairFloor": "Fair Floor Price",
    "badge.directWorker": "100% Direct Payout",
  },
  kn: {
    // Navigation
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.nearby": "ಹತ್ತಿರದ ಪಿಕಪ್ ರಡಾರ್",
    "nav.route": "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಯೋಜನೆ",
    "nav.karma": "ಕರ್ಮ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್",
    "nav.health": "ಸುರಕ್ಷಾ ಹೆಲ್ತ್ ಪೂಲ್",
    "nav.benefits": "ಕಲ್ಯಾಣ ಮತ್ತು ಸೌಲಭ್ಯಗಳು",
    "nav.myjobs": "ನನ್ನ ಕೆಲಸಗಳು",
    "nav.earnings": "ಗಳಿಕೆ ಮತ್ತು ವ್ಯಾಲೆಟ್",
    "nav.wallet": "ಗಳಿಕೆ ಮತ್ತು UPI ವ್ಯಾಲೆಟ್",
    "nav.profile": "ನನ್ನ ಪ್ರೊಫೈಲ್",
    "nav.help": "ಸುರಕ್ಷತೆ ಮತ್ತು ಸಹಾಯ",
    "nav.schedule": "ಪಿಕಪ್ ಬುಕ್ ಮಾಡಿ",
    "nav.mypickups": "ನನ್ನ ಪಿಕಪ್‌ಗಳು",
    "nav.leaderboard": "ಗ್ರೀನ್ ಲೀಡರ್‌ಬೋರ್ಡ್",
    "nav.priceboard": "ನ್ಯಾಯಯುತ ಬೆಲೆ ಮಂಡಳಿ",
    "nav.impact": "ಪರಿಸರ ಪ್ರಭಾವ",
    "nav.payments": "ಪಾವತಿಗಳು",
    "nav.logout": "ಲಾಗ್‌ಔಟ್",
    "nav.users": "ಬಳಕೆದಾರರು",
    "nav.pickups": "ಪಿಕಪ್ ರವಾನೆ",
    "nav.fairness": "ನ್ಯಾಯಯುತ ವಿಶ್ಲೇಷಣೆ",
    "nav.disputes": "ದೂರು ನಿವಾರಣೆ",
    "nav.settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",

    // Bottom Navigation
    "tab.home": "ಮುಖಪುಟ",
    "tab.jobs": "ಕೆಲಸಗಳು",
    "tab.wallet": "ವ್ಯಾಲೆಟ್",
    "tab.benefits": "ಲಾಭಗಳು",
    "tab.profile": "ಪ್ರೊಫೈಲ್",

    // Dashboard
    "dash.greeting": "ನಮಸ್ಕಾರ",
    "dash.subtitle": "ಇಲ್ಲಿ ನಿಮ್ಮ ಇಂದಿನ ಗಳಿಕೆ ಮತ್ತು ಮಾರ್ಗದ ವಿವರಗಳಿವೆ.",
    "dash.nextPickupTitle": "ನಿಮ್ಮ ಮುಂದಿನ ಪಿಕಪ್",
    "dash.startNavigation": "ಮಾರ್ಗ ಆರಂಭಿಸಿ / ಪಿಕಪ್‌ಗೆ ತೆರಳಿ",
    "dash.markArrived": "ತಲುಪಿದೆ ಮತ್ತು ತೂಕ ದೃಢೀಕರಿಸಿ",
    "dash.online": "ಆನ್‌ಲೈನ್ ಮತ್ತು ಸಕ್ರಿಯ",
    "dash.busy": "ಕಾರ್ಯನಿರತ",
    "dash.todayEarnings": "ಇಂದಿನ ಗಳಿಕೆ",
    "dash.weeklyEarnings": "ವಾರದ ಗಳಿಕೆ",
    "dash.pendingPayouts": "ಬಾಕಿ ಪಾವತಿ",
    "dash.jobsCompleted": "ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು",
    "dash.goal": "ಗುರಿ: ₹800",
    "dash.routeSummary": "ಸೂಚಿಸಿದ ಮಾರ್ಗ",
    "dash.routeSubtitle": "ಕಡಿಮೆ ಶ್ರಮದಲ್ಲಿ ಹೆಚ್ಚು ಗಳಿಸಲು ಈ ಪಿಕಪ್‌ಗಳನ್ನು ಕ್ರಮವಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿ.",
    "dash.opportunityScore": "ನ್ಯಾಯಯುತ ಅವಕಾಶ ಸ್ಕೋರ್",
    "dash.opportunityDesc": "ನಿಮ್ಮ ಗಳಿಕೆಯನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ಅಲ್ಗಾರಿದಮ್ ನಿಮಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತಿದೆ!",
    "dash.acceptedPickups": "ಸ್ವೀಕರಿಸಿದ ಪಿಕಪ್‌ಗಳು",
    "dash.markCompleted": "ಪೂರ್ಣಗೊಳಿಸಿ",
    "dash.expectedPayout": "ಗಳಿಕೆ",
    "dash.recommendedNearby": "ಹತ್ತಿರದ ಹೊಸ ಪಿಕಪ್‌ಗಳು",
    "dash.viewMap": "ನಕ್ಷೆ ನೋಡಿ",
    "dash.viewList": "ಪಟ್ಟಿ ನೋಡಿ",
    "dash.accept": "ಸ್ವೀಕರಿಸಿ",
    "dash.noJobs": "ಯಾವುದೇ ಸಕ್ರಿಯ ಪಿಕಪ್‌ಗಳಿಲ್ಲ.",

    // Nearby Radar
    "radar.title": "ಹತ್ತಿರದ ಪಿಕಪ್ ರಡಾರ್",
    "radar.subtitle": "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಲಭ್ಯವಿರುವ ಪಿಕಪ್‌ಗಳು.",
    "radar.filterTitle": "ಫಿಲ್ಟರ್",
    "radar.category": "ಕಸದ ವರ್ಗ",
    "radar.maxDistance": "ದೂರ (ಕಿಮೀ)",
    "radar.minPayout": "ಕನಿಷ್ಠ ಗಳಿಕೆ (₹)",
    "radar.urgency": "ತುರ್ತು",
    "radar.allRecyclables": "ಎಲ್ಲಾ ವಸ್ತುಗಳು",
    "radar.plastic": "ಪ್ಲಾಸ್ಟಿಕ್",
    "radar.cardboard": "ಕಾಗದ",
    "radar.metal": "ಲೋಹ",
    "radar.ewaste": "ಇ-ಕಸ",
    "radar.glass": "ಗಾಜು",
    "radar.noRequests": "ಯಾವುದೇ ಪಿಕಪ್ ಲಭ್ಯವಿಲ್ಲ.",
    "radar.acceptPickup": "ಸ್ವೀಕರಿಸಿ",
    "radar.accepted": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    "radar.payout": "ಗಳಿಕೆ",
    "radar.distance": "ದೂರ",
    "radar.estWeight": "ಅಂದಾಜು ತೂಕ",
    "radar.timeSlot": "ಸಮಯ",
    "radar.viewRoute": "ಮಾರ್ಗ ನೋಡಿ",

    // Route & Strain
    "route.title": "ಸ್ಮಾರ್ಟ್ ಮಾರ್ಗ ಯೋಜನೆ",
    "route.subtitle": "ಕಡಿಮೆ ಶ್ರಮದ ಮಾರ್ಗಗಳು.",
    "route.strainIndex": "ಶ್ರಮ ಸೂಚ್ಯಂಕ",
    "route.lowStrain": "ಕಡಿಮೆ ಶ್ರಮ",
    "route.cartCapacity": "ವಾಹನ ಸಾಮರ್ಥ್ಯ",
    "route.startRun": "ಮಾರ್ಗ ಪ್ರಾರಂಭಿಸಿ",
    "route.optimalNotice": "💡 ಇಳಿಜಾರು ಆಧಾರಿತ ಮಾರ್ಗ ರಚಿಸಲಾಗಿದೆ.",

    // Karma Credit
    "karma.title": "ಕರ್ಮ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್",
    "karma.subtitle": "ನಿಮ್ಮ ಕೆಲಸದ ಆಧಾರದ ಮೇಲೆ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್.",
    "karma.scoreLabel": "ನಿಮ್ಮ ಸ್ಕೋರ್",
    "karma.excellent": "ಉತ್ತಮ ಸ್ಕೋರ್",
    "karma.microloanTitle": "ಸಾಲ ಸಿಮ್ಯುಲೇಟರ್",
    "karma.loanSubtitle": "ಸುಲಭ ಸಾಲ ಸೌಲಭ್ಯ.",
    "karma.applyLoan": "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    "karma.badges": "ಬ್ಯಾಡ್ಜ್‌ಗಳು",

    // Health Pool
    "health.title": "ಸುರಕ್ಷಾ ಹೆಲ್ತ್ ಪೂಲ್",
    "health.subtitle": "ಆರೋಗ್ಯ ಮತ್ತು ತುರ್ತು ನೆರವು ನಿಧಿ.",
    "health.poolBalance": "ಲಭ್ಯವಿರುವ ನಿಧಿ",
    "health.yourCoverage": "ವಿಮಾ ರಕ್ಷಣೆ",
    "health.fileClaim": "ಕ್ಲೈಮ್ ಮಾಡಿ",
    "health.recentClaims": "ಇತ್ತೀಚಿನ ಕ್ಲೈಮ್‌ಗಳು",
    "health.claimModalTitle": "ತುರ್ತು ಅರ್ಜಿ",
    "health.claimSubmit": "ಸಲ್ಲಿಸಿ",

    // Wallet
    "wallet.title": "ಡಿಜಿಟಲ್ ವ್ಯಾಲೆಟ್",
    "wallet.subtitle": "ನೇರ ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ.",
    "wallet.balance": "ವ್ಯಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್",
    "wallet.withdraw": "ವರ್ಗಾವಣೆ",
    "wallet.transferSuccess": "ಹಣ ಜಮೆಯಾಗಿದೆ!",
    "wallet.txHistory": "ಇತಿಹಾಸ",
    "wallet.directNotice": "✓ 100% ನೇರ ಪಾವತಿ.",

    // Generator Pages
    "gen.title": "ಪೌರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "gen.subtitle": "ನಿಮ್ಮ ಪರಿಸರ ಕೊಡುಗೆಗಳು.",
    "gen.scheduleTitle": "ಪಿಕಪ್ ನಿಗದಿಪಡಿಸಿ",
    "gen.scheduleSubtitle": "ಮನೆಯಿಂದಲೇ ರಿಸೈಕಲ್ ಮಾಡಿ.",
    "gen.leaderboardTitle": "ಗ್ರೀನ್ ಲೀಡರ್‌ಬೋರ್ಡ್",
    "gen.leaderboardSubtitle": "ಉನ್ನತ ಶ್ರೇಯಾಂಕದ ಪೌರರು.",
    "gen.priceboardTitle": "ನ್ಯಾಯಯುತ ಬೆಲೆ ಮಂಡಳಿ",
    "gen.priceboardSubtitle": "ಪ್ರಮಾಣಿತ ದರಗಳು.",
    "gen.impactTitle": "ಪರಿಸರ ಪ್ರಭಾವ",
    "gen.impactSubtitle": "ಇಂಗಾಲದ ಉಳಿತಾಯ.",
    "gen.paymentsTitle": "ಪಾವತಿಗಳು",
    "gen.paymentsSubtitle": "ಪಾವತಿ ವಿವರಗಳು.",

    // Common
    "voice.barTitle": "🇮🇳 ಧ್ವನಿ ಸಹಾಯಕ",
    "voice.barSubtitle": "ಯಾವುದೇ ಕಾರ್ಡ್‌ನಲ್ಲಿ ವಿವರಗಳನ್ನು ಕೇಳಲು 🔊 ಒತ್ತಿರಿ",
    "voice.speakBtn": "ಮಾತನಾಡಿ",
    "voice.listen": "ಕೇಳಿ",
    "voice.listening": "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...",
    "btn.accept": "ಸ್ವೀಕರಿಸಿ",
    "btn.complete": "ಮುಗಿಸಿ",
    "btn.viewReceipt": "ರಸೀದಿ ನೋಡಿ",
    "btn.dispute": "ದೂರು ನೀಡಿ",
    "btn.withdraw": "ವರ್ಗಾವಣೆ",
    "btn.save": "ಉಳಿಸಿ",
    "btn.cancel": "ರದ್ದುಮಾಡಿ",
    "badge.fairFloor": "100% ನೇರ ಪಾವತಿ",
    "badge.directWorker": "100% ಕಾರ್ಮಿಕರಿಗೆ",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "hi",
  setLang: () => {},
  t: (key: string) => key,
  speak: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("hi");

  useEffect(() => {
    const saved = localStorage.getItem("recircle_lang") as Language;
    if (saved && (saved === "hi" || saved === "en" || saved === "kn")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("recircle_lang", newLang);
    if (newLang === "hi") {
      toast.success("भाषा: हिन्दी (Hindi) - सभी पेज हिन्दी में बदल दिए गए");
    } else if (newLang === "kn") {
      toast.success("ಭಾಷೆ: ಕನ್ನಡ (Kannada)");
    } else {
      toast.success("Language: English - All pages switched to English");
    }
  };

  const t = (key: string): string => {
    return DICTIONARY[lang]?.[key] || DICTIONARY.en?.[key] || key;
  };

  const speak = (text: string) => {
    const langCode = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : "en-IN";
    speakText(text, langCode);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, speak }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
