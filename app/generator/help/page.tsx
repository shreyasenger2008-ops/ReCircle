"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle, 
  MessageCircle, BookOpen, Recycle
} from "lucide-react";

export default function GeneratorHelpPage() {
  const { lang, t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: lang === "hi" ? "उचित मूल्य (Fair Price) की गणना कैसे की जाती है?" : "How is the fair price calculated?",
      a: lang === "hi" 
        ? "हमारा एल्गोरिदम गारंटी देता है कि गणना किए गए मूल्य का 100% सीधे सफाई मित्र को जाता है। इसमें प्रति किलो कमोडिटी बाजार दर (जैसे प्लास्टिक ₹12/kg, धातु ₹35/kg), प्लस यात्रा मुआवजा (₹5/km), और स्वच्छ छंटाई का बोनस शामिल होता है।"
        : "Our algorithm guarantees that 100% of the calculated price goes directly to the waste-picker. The formula includes the commodity market rate per kg plus travel compensation and sorting difficulty bonuses."
    },
    {
      q: lang === "hi" ? "फेयर मैच एल्गोरिदम सफाई मित्र का चयन कैसे करता है?" : "How does the Fair Match algorithm choose a picker?",
      a: lang === "hi"
        ? "उबर जैसी ऐप्स के विपरीत जहां कुछ ही ड्राइवर सारा काम ले लेते हैं, ReCircle Fair एक एंटी-मोनोपोली फॉर्मूला का उपयोग करता है। यह उन सफाई मित्रों को प्राथमिकता देता है जिन्हें आज कम काम मिला है (आय संतुलन - 20%), निकटता (25%), और विश्वसनीयता रेटिंग (15%)।"
        : "Unlike Uber-style apps, ReCircle Fair uses an Anti-Monopoly matching formula. It prioritizes pickers who have had fewer jobs today, proximity, and reliability trust score."
    },
    {
      q: lang === "hi" ? "'सुरक्षा कवच' हेल्थ पूल क्या है?" : "What is the 'Suraksha Kawach' Health Pool?",
      a: lang === "hi"
        ? "सफाई मित्र बिना स्वास्थ्य बीमा के नुकीली और खतरनाक सामग्री संभालते हैं। जब आप अपने भुगतान को +₹10 राउंड अप करते हैं, तो अतिरिक्त राशि एक आपातकालीन स्वास्थ्य कोष में जाती है जो चोट लगने पर तुरंत चिकित्सा सहायता देती है।"
        : "Informal waste-pickers handle hazardous materials without health insurance. Rounding up your payment pools funds into an emergency health pool for worker injury relief."
    },
    {
      q: lang === "hi" ? "यदि वजन में कोई अंतर हो तो क्या होगा?" : "What happens if there is a weight discrepancy?",
      a: lang === "hi"
        ? "पिकअप के समय सफाई मित्र आपके सामने डिजिटल तराजू से अंतिम वजन की पुष्टि करता है। यदि आप असहमत हैं, तो आप 'शिकायत दर्ज करें' बटन दबा सकते हैं और एनजीओ डेस्क 24 घंटे के भीतर इसका समाधान करेगा।"
        : "At pickup, the picker confirms final weight with a digital scale. If you disagree, tap 'Raise Dispute' for 24-hour arbitration."
    },
    {
      q: lang === "hi" ? "क्या पिकअप से पहले कचरा धोना आवश्यक है?" : "Do I need to wash recyclables before pickup?",
      a: lang === "hi"
        ? "हाँ! कृपया दूध के पैकेट, प्लास्टिक के डिब्बे और कैन को धोकर सुखाएं। साफ कचरा बैक्टीरिया से बचाता है और सफाई मित्र को उचित मूल्य दिलाता है।"
        : "Yes! Please rinse plastic milk pouches, containers, and cans to ensure safe handling and higher sorting compensation."
    }
  ];

  const segregationRules = [
    {
      category: lang === "hi" ? "🧴 पुनर्चक्रण योग्य सूखा कचरा (स्वीकृत)" : "🧴 Recyclable Dry Waste (ACCEPTED)",
      color: "border-emerald-200 bg-emerald-50/60 text-emerald-950",
      items: lang === "hi" 
        ? ["प्लास्टिक की बोतलें और जार (PET, HDPE)", "गत्ते के डिब्बे और पुराने अखबार", "एल्युमिनियम के डिब्बे और लोहे का कबाड़", "कांच की साबुत बोतलें और शीशियां", "ई-कचरा (चार्जर, पुराने फोन, केबल)"]
        : ["Plastic bottles & jars (PET, HDPE)", "Cardboard boxes & newspapers", "Aluminium cans & steel scrap", "Glass bottles & jars (unbroken)", "Electronic e-waste (chargers, phones)"],
      status: "good"
    },
    {
      category: lang === "hi" ? "🚫 गैर-पुनर्चक्रण योग्य / गीला कचरा (न मिलाएं)" : "🚫 Non-Recyclable / Wet Waste (DO NOT MIX)",
      color: "border-rose-200 bg-rose-50/60 text-rose-950",
      items: lang === "hi"
        ? ["रसोई का गीला खाना और छिलके", "सैनिटरी पैड, डायपर और वाइप्स", "तेल से सने कागज और प्लेट", "टूटे हुए कांच के टुकड़े (अलग लपेटें)", "रसायन रिसाव वाली पुरानी बैटरियां"]
        : ["Wet kitchen food scraps & peelings", "Sanitary pads, diapers & wipes", "Contaminated oily paper plates", "Broken glass shards (wrap separately)", "Batteries with chemical leaks"],
      status: "bad"
    }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "सहायता व कचरा पृथक्करण (Segregation) गाइड" : "Help & Waste Segregation Guide"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" ? "नैतिक रीसाइक्लिंग, उचित मूल्य और सफाई मित्र सुरक्षा के बारे में सब कुछ।" : "Everything you need to know about ethical recycling, pricing, and worker safety."}
          </p>
        </div>
        <a 
          href="https://wa.me/?text=Hi%20ReCircle%20Support" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="bg-[#00a884] hover:bg-[#008f6f] text-slate-950 font-bold gap-2 rounded-xl shadow-xs text-xs h-10">
            <MessageCircle className="h-4 w-4" /> {lang === "hi" ? "व्हाट्सएप सहायता" : "Live WhatsApp Help"}
          </Button>
        </a>
      </div>

      {/* Segregation Guide Cards */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <Recycle className="h-5 w-5 text-emerald-600" />
            {lang === "hi" ? "घरेलू कचरा छंटाई मास्टर गाइड" : "Home Scrap Segregation Master Guide"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "उचित छंटाई सफाई मित्रों को स्वास्थ्य खतरों से बचाती है और उन्हें अधिक मूल्य दिलाती है" : "Proper sorting protects waste-pickers from occupational health hazards"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid md:grid-cols-2 gap-4">
            {segregationRules.map((rule, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${rule.color}`}>
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  {rule.status === "good" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
                  {rule.category}
                </h4>
                <ul className="space-y-2 text-xs font-medium">
                  {rule.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequently Asked Questions */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
        <CardHeader className="p-5 pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {lang === "hi" ? "अक्सर पूछे जाने वाले सवाल (FAQs)" : "Frequently Asked Questions"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {lang === "hi" ? "हमारी निष्पक्ष मिलान प्रणाली और सफाई मित्र सशक्तिकरण के नियम" : "Learn about our transparent matching and worker empowerment mechanics"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center text-left font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 animate-in fade-in duration-200">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}