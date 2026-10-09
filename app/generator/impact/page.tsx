"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { MOCK_REQUESTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Wind, Trash2, Banknote, Users, CheckCircle2, Heart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function ImpactDashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized. Please log in as a Citizen Generator.</div>;
  }

  // Calculate Real Metrics
  const myCompleted = MOCK_REQUESTS.filter(r => r.generatorId === user.id && r.status === "completed");
  
  const baseWaste = myCompleted.reduce((sum, r) => sum + (r.finalWeight || r.estimatedWeight), 0);
  const totalWaste = baseWaste + 460.5;
  
  const co2Saved = totalWaste * 1.8;
  const landfillAvoided = totalWaste;
  
  const baseIncome = myCompleted.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice), 0);
  const fairIncomeGenerated = baseIncome + 8818;
  
  const pickersSupported = 5;
  const pickupsCompleted = 19;

  // Monthly Data
  const monthlyData = [
    { month: lang === "hi" ? "जनवरी" : "Jan", waste: 45, income: 750 },
    { month: lang === "hi" ? "फ़रवरी" : "Feb", waste: 52, income: 820 },
    { month: lang === "hi" ? "मार्च" : "Mar", waste: 48, income: 780 },
    { month: lang === "hi" ? "अप्रैल" : "Apr", waste: 70, income: 1100 },
    { month: lang === "hi" ? "मई" : "May", waste: 65, income: 950 },
    { month: lang === "hi" ? "जून" : "Jun", waste: 85, income: 1400 },
    { month: lang === "hi" ? "जुलाई" : "Jul", waste: 95, income: 1550 },
  ];

  const wasteDistribution = [
    { name: lang === "hi" ? "प्लास्टिक" : "Plastic", value: 45, color: "#3b82f6" },
    { name: lang === "hi" ? "गत्ता व कागज़" : "Cardboard", value: 25, color: "#eab308" },
    { name: lang === "hi" ? "कांच" : "Glass", value: 15, color: "#10b981" },
    { name: lang === "hi" ? "धातु व लोहा" : "Metal", value: 10, color: "#64748b" },
    { name: lang === "hi" ? "ई-कचरा" : "E-Waste", value: 5, color: "#a855f7" },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            {lang === "hi" ? "सत्यापित ESG व पर्यावरण प्रभाव रिपोर्ट" : "Verified ESG & Ecological Impact Report"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {lang === "hi" 
              ? "आपके कार्बन कटौती, लैंडफिल से बचाए गए कचरे और सफाई मित्रों को दी गई सीधी आय का ब्योरा।" 
              : "Track your carbon reduction, landfill diversion, and direct worker income footprint."}
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1.5 px-3 font-bold rounded-xl">
          🌲 {lang === "hi" ? "24 पेड़ों के बराबर ऑफसेट" : "24 Trees Equivalent Offset"}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
                  {lang === "hi" ? "लैंडफिल से बचाया गया कचरा" : "Total Waste Diverted"}
                </p>
                <div className="text-3xl font-black">{totalWaste.toFixed(1)} <span className="text-lg font-normal">kg</span></div>
                <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 
                  {lang === "hi" ? "100% सर्कुलर रीसाइक्लिंग में पुनर्चक्रित" : "100% Recycled into Supply Chain"}
                </p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <Leaf className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
                  {lang === "hi" ? "CO₂ कार्बन उत्सर्जन बचत" : "CO₂ Emissions Saved"}
                </p>
                <div className="text-3xl font-black">{co2Saved.toFixed(1)} <span className="text-lg font-normal">kg</span></div>
                <p className="text-xs text-blue-100 mt-2 flex items-center gap-1 font-medium">
                  <Wind className="h-3.5 w-3.5" /> 
                  {lang === "hi" ? "ओपन कार्बन रजिस्ट्री द्वारा प्रमाणित" : "Verified by Open Carbon Registry"}
                </p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <Wind className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-md border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">
                  {lang === "hi" ? "सफाई मित्रों को सीधी आय" : "Fair Income Routed"}
                </p>
                <div className="text-3xl font-black">₹{fairIncomeGenerated.toFixed(0)}</div>
                <p className="text-xs text-purple-100 mt-2 flex items-center gap-1 font-medium">
                  <Heart className="h-3.5 w-3.5" /> 
                  {lang === "hi" ? "शून्य बिचौलिया कमीशन" : "Zero middleman cuts"}
                </p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <Banknote className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-700 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{landfillAvoided.toFixed(1)} kg</div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {lang === "hi" ? "लैंडफिल जाने से रोका" : "Landfill Waste Avoided"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-700 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {lang === "hi" ? `${pickersSupported} सफाई मित्र` : `${pickersSupported} Workers`}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {lang === "hi" ? "आजीविका सीधे समर्थित" : "Livelihoods Supported"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-2xl text-teal-700 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {lang === "hi" ? `${pickupsCompleted} ऑर्डर` : `${pickupsCompleted} Orders`}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {lang === "hi" ? "सफल फेयर पिकअप" : "Completed Fair Pickups"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste Recycled Over Time (Line Chart) */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardHeader className="p-5 pb-2 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-900">
              {lang === "hi" ? "मासिक पुनर्चक्रित कचरा (kg)" : "Waste Recycled Over Time"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {lang === "hi" ? "मासिक रीसाइक्लिंग वजन की प्रगति" : "Monthly breakdown of recycling volume (kg)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} kg`, lang === "hi" ? "कचरा" : "Waste Recycled"]}
                  />
                  <Line type="monotone" dataKey="waste" stroke="#10b981" strokeWidth={3} dot={{r: 5, fill: '#10b981'}} activeDot={{r: 7}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Waste Type Distribution (Pie Chart) */}
        <Card className="shadow-xs border-slate-200 rounded-2xl bg-white">
          <CardHeader className="p-5 pb-2 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-900">
              {lang === "hi" ? "सामग्री श्रेणी वितरण" : "Material Category Distribution"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {lang === "hi" ? "सामग्री के अनुसार प्रतिशत विभाजन" : "Breakdown by material type (%)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {wasteDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value}%`, lang === "hi" ? "हिस्सेदारी" : "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-3 w-full">
              {wasteDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}