"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Leaf, Heart, Users, Building } from "lucide-react";

export default function GeneratorLeaderboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"citizens" | "societies">("citizens");

  const topCitizens = [
    { rank: 1, name: lang === "hi" ? "राजेश कुमार (आप)" : "Rajesh Kumar (You)", points: 1450, wasteKg: 125, co2Saved: 250, tipsGiven: 180, badge: lang === "hi" ? "🥇 इको लीजेंड" : "🥇 Eco Legend" },
    { rank: 2, name: lang === "hi" ? "अंजलि गुप्ता" : "Anjali Gupta", points: 1280, wasteKg: 110, co2Saved: 220, tipsGiven: 140, badge: lang === "hi" ? "🥈 ग्रीन पायनियर" : "🥈 Green Pioneer" },
    { rank: 3, name: lang === "hi" ? "विक्रम मल्होत्रा" : "Vikram Malhotra", points: 1120, wasteKg: 95, co2Saved: 190, tipsGiven: 120, badge: lang === "hi" ? "🥉 वेस्ट वॉरियर" : "🥉 Waste Warrior" },
    { rank: 4, name: lang === "hi" ? "स्नेहा रेड्डी" : "Sneha Reddy", points: 940, wasteKg: 80, co2Saved: 160, tipsGiven: 80, badge: lang === "hi" ? "⭐ उत्कृष्ट सेग्रीगेटर" : "⭐ Pure Sorter" },
    { rank: 5, name: lang === "hi" ? "अमिताभ सेन" : "Amitabh Sen", points: 820, wasteKg: 70, co2Saved: 140, tipsGiven: 60, badge: lang === "hi" ? "🌱 इको चैंपियन" : "🌱 Eco Champion" },
  ];

  const topSocieties = [
    { rank: 1, name: lang === "hi" ? "ग्रीनवुड्स एन्क्लेव" : "Greenwoods Luxury Enclave", households: 180, totalKg: 2450, co2Tons: 4.9, healthPoolContribution: 8400, badge: lang === "hi" ? "🏆 शून्य-कचरा सोसाइटी 2026" : "🏆 Zero-Waste Society 2026" },
    { rank: 2, name: "Prestige Ozone Villas", households: 120, totalKg: 1820, co2Tons: 3.6, healthPoolContribution: 6200, badge: lang === "hi" ? "🌟 प्लैटिनम ग्रीन कॉम्प्लेक्स" : "🌟 Platinum Green Complex" },
    { rank: 3, name: "Palm Meadows Society", households: 95, totalKg: 1340, co2Tons: 2.7, healthPoolContribution: 4500, badge: lang === "hi" ? "✨ गोल्ड रीसाइक्लिंग हब" : "✨ Gold Recycling Hub" },
    { rank: 4, name: "Sobha City Apartments", households: 210, totalKg: 1150, co2Tons: 2.3, healthPoolContribution: 3800, badge: lang === "hi" ? "🌱 उभरता हुआ ग्रीन समुदाय" : "🌱 Rising Green Community" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            {lang === "hi" ? "नागरिक व सोसाइटी ग्रीन लीडरबोर्ड" : "Citizen & Society Green Leaderboard"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" 
              ? "उचित पारिश्रमिक और शून्य-लैंडफिल रीसाइक्लिंग को बढ़ावा देने वाले शीर्ष नागरिक व अपार्टमेंट परिसर।"
              : "Recognizing top citizens and apartment complexes championing fair wages & zero-landfill recycling."}
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("citizens")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "citizens" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "hi" ? "शीर्ष नागरिक" : "Top Citizens"}
          </button>
          <button
            onClick={() => setActiveTab("societies")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "societies" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "hi" ? "अपार्टमेंट सोसायटियां" : "Apartment Societies"}
          </button>
        </div>
      </div>

      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 mb-1">
                  {lang === "hi" ? "आपकी ग्रीन कर्मा रैंक" : "Your Green Karma Rank"}
                </p>
                <h3 className="text-3xl font-black">{lang === "hi" ? "वार्ड 84 में #1" : "#1 in Ward 84"}</h3>
                <p className="text-xs text-emerald-100 mt-1">{lang === "hi" ? "1,450 कर्मा अंक अर्जित" : "1,450 Karma Points earned"}</p>
              </div>
              <div className="p-2.5 bg-white/20 rounded-2xl">
                <Medal className="h-6 w-6 text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {lang === "hi" ? "बचाया गया कुल CO₂" : "Total CO₂ Diverted"}
                </p>
                <h3 className="text-3xl font-black text-slate-900">250 kg</h3>
                <p className="text-xs text-emerald-600 mt-1 font-semibold">
                  {lang === "hi" ? "12.5 पेड़ लगाने के बराबर 🌳" : "Equal to 12.5 trees planted 🌳"}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                <Leaf className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {lang === "hi" ? "सुरक्षा हेल्थ फंड सहायता" : "Health Pool Tips"}
                </p>
                <h3 className="text-3xl font-black text-rose-600">₹180</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "hi" ? "सुरक्षा कवच फंड में योगदान" : "Contributed to Suraksha Kawach Fund"}
                </p>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600">
                <Heart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card className="shadow-xs border-slate-200 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            {activeTab === "citizens" ? <Users className="h-5 w-5 text-emerald-600" /> : <Building className="h-5 w-5 text-blue-600" />}
            {activeTab === "citizens" 
              ? (lang === "hi" ? "नागरिक ग्रीन कर्मा लीडरबोर्ड" : "Citizen Green Karma Leaderboard")
              : (lang === "hi" ? "अपार्टमेंट सोसाइटी रीसाइक्लिंग रैंकिंग" : "Apartment Complex Recycling Ranks")}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {activeTab === "citizens"
              ? (lang === "hi" ? "सत्यापित रीसाइक्लिंग वजन और सफाई मित्र सम्मान टिप के आधार पर रैंकिंग" : "Citizens ranked by verified recyclable volume and worker dignity tips")
              : (lang === "hi" ? "बिना बिचौलियों के सीधे सामुदायिक स्क्रैप अभियान चलाने वाली सोसायटियां" : "Societies organizing bulk community scrap drives with zero middlemen")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === "citizens" ? (
            <div className="divide-y divide-slate-100">
              {topCitizens.map((c) => (
                <div
                  key={c.rank}
                  className={`p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                    c.rank === 1 ? "bg-amber-50/40 border-l-4 border-l-amber-400" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        c.rank === 1
                          ? "bg-amber-400 text-slate-950"
                          : c.rank === 2
                          ? "bg-slate-300 text-slate-800"
                          : c.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.rank}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {c.name}
                        <Badge variant="outline" className="text-[10px] bg-white border-amber-300 text-amber-800 rounded-lg">
                          {c.badge}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>♻️ {c.wasteKg} kg {lang === "hi" ? "रीसायकल" : "recycled"}</span>
                        <span>•</span>
                        <span>🌱 {c.co2Saved} kg CO₂ {lang === "hi" ? "बचत" : "saved"}</span>
                        <span>•</span>
                        <span className="text-rose-600 font-medium">❤️ ₹{c.tipsGiven} {lang === "hi" ? "हेल्थ टिप" : "worker tips"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:pl-4">
                    <div className="text-2xl font-black text-emerald-600">{c.points.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      {lang === "hi" ? "ग्रीन पॉइंट्स" : "Green Points"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topSocieties.map((s) => (
                <div key={s.rank} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm shrink-0">
                      #{s.rank}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {s.name}
                        <Badge className="bg-blue-100 text-blue-800 text-[10px] border-none rounded-lg">{s.badge}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>🏢 {s.households} {lang === "hi" ? "प्रतिभागी फ्लैट्स" : "Participating Flats"}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">📦 {s.totalKg} kg {lang === "hi" ? "कचरा रीसायकल" : "Diverted"}</span>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold">❤️ ₹{s.healthPoolContribution.toLocaleString()} {lang === "hi" ? "सुरक्षा फंड जुटाया" : "Health Fund Raised"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-blue-600">{s.co2Tons} Tons</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {lang === "hi" ? "CO₂ फुटप्रिंट ऑफसेट" : "CO₂ Footprint Offset"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
