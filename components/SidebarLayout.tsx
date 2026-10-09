"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage, Language } from "@/lib/language-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, CalendarPlus, Recycle, DollarSign, Heart, CreditCard, User, HelpCircle,
  Map, CheckSquare, MapPin, Banknote, Wallet, Award, HeartPulse, Trophy,
  Users, Trash2, BarChart3, AlertTriangle, FileText, Settings, LogOut, Menu, X,
  ShieldCheck, Sparkles, ChevronRight, Leaf, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MOCK_USERS } from "@/lib/mock-data";
import CitizenEcoBot from "@/components/CitizenEcoBot";
import PickerVoiceSaathi from "@/components/PickerVoiceSaathi";

export default function SidebarLayout({ children, role }: { children: React.ReactNode, role: string }) {
  const { user, login, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (role === "generator" && lang !== "en") {
      setLang("en");
    }
  }, [role, lang, setLang]);

  useEffect(() => {
    if (user && user.role !== role) {
      router.push(`/${user.role}/dashboard`);
    } else if (user === null) {
      const saved = localStorage.getItem("mock_user_id");
      if (!saved) {
        router.push("/login");
      }
    }
  }, [user, role, router]);

  const navItemsMap: Record<string, Array<{ nameKey: string; fallback: string; href: string; icon: React.ElementType; badge?: string }>> = {
    generator: [
      { nameKey: "nav.dashboard", fallback: "Dashboard", href: "/generator/dashboard", icon: LayoutDashboard },
      { nameKey: "nav.schedule", fallback: "Schedule Pickup", href: "/generator/schedule-pickup", icon: CalendarPlus, badge: "AI" },
      { nameKey: "nav.mypickups", fallback: "My Pickups", href: "/generator/my-pickups", icon: Recycle },
      { nameKey: "nav.leaderboard", fallback: "Green Leaderboard", href: "/generator/leaderboard", icon: Trophy, badge: "Top 1" },
      { nameKey: "nav.priceboard", fallback: "Fair Price Board", href: "/generator/fair-price-board", icon: DollarSign },
      { nameKey: "nav.impact", fallback: "Impact Report", href: "/generator/impact", icon: Heart },
      { nameKey: "nav.payments", fallback: "Payments & Wallet", href: "/generator/payments", icon: CreditCard },
      { nameKey: "nav.profile", fallback: "User Profile", href: "/generator/profile", icon: User },
      { nameKey: "nav.help", fallback: "Segregation Help", href: "/generator/help", icon: HelpCircle },
    ],
    picker: [
      { nameKey: "nav.dashboard", fallback: "Dashboard", href: "/picker/dashboard", icon: LayoutDashboard },
      { nameKey: "nav.nearby", fallback: "Nearby Radar", href: "/picker/nearby-requests", icon: Map, badge: "Live" },
      { nameKey: "nav.route", fallback: "Route & Strain", href: "/picker/route-planner", icon: MapPin, badge: "Slope" },
      { nameKey: "nav.karma", fallback: "Karma Credit", href: "/picker/karma-credit", icon: Award, badge: "782" },
      { nameKey: "nav.health", fallback: "Health Safety Pool", href: "/picker/health-pool", icon: HeartPulse },
      { nameKey: "nav.myjobs", fallback: "My Jobs", href: "/picker/my-pickups", icon: CheckSquare },
      { nameKey: "nav.earnings", fallback: "Earnings", href: "/picker/earnings", icon: Banknote },
      { nameKey: "nav.wallet", fallback: "UPI Wallet", href: "/picker/wallet", icon: Wallet },
      { nameKey: "nav.profile", fallback: "Worker Profile", href: "/picker/profile", icon: User },
      { nameKey: "nav.help", fallback: "Safety & Help", href: "/picker/help", icon: HelpCircle },
    ],
    admin: [
      { nameKey: "nav.dashboard", fallback: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { nameKey: "nav.users", fallback: "Users & Verifications", href: "/admin/users", icon: Users },
      { nameKey: "nav.pickups", fallback: "Pickups Dispatch", href: "/admin/pickups", icon: Trash2 },
      { nameKey: "nav.fairness", fallback: "Fairness Analytics", href: "/admin/fairness-analytics", icon: BarChart3, badge: "Gini" },
      { nameKey: "nav.disputes", fallback: "Dispute Arbitration", href: "/admin/disputes", icon: AlertTriangle },
      { nameKey: "nav.priceboard", fallback: "Fair Rate Board", href: "/admin/price-board", icon: DollarSign },
      { nameKey: "nav.impact", fallback: "ESG Impact Reports", href: "/admin/impact-reports", icon: FileText },
      { nameKey: "nav.settings", fallback: "Platform Settings", href: "/admin/settings", icon: Settings },
    ]
  };

  const navItems = navItemsMap[role] || [];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const roleTitle = role === "generator" 
    ? (lang === "hi" ? "नागरिक पोर्टल (Citizen)" : "Citizen Generator")
    : role === "picker" 
    ? (lang === "hi" ? "सफाई मित्र साथी (Waste-Picker)" : "Waste-Picker Partner")
    : "Admin / NGO Oversight";

  return (
    <div className="flex h-screen bg-slate-50/70 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sleek Dark Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0c141d] text-slate-200 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-18 px-5 border-b border-slate-800/80 bg-[#090f17]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Recycle className="h-6 w-6 text-slate-950 font-black" />
              </div>
              <div>
                <span className="font-black text-xl text-white tracking-tight flex items-center gap-1">
                  ReCircle <span className="text-emerald-400">Fair</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono block -mt-1">
                  {lang === "hi" ? "100% निष्पक्ष रीसाइक्लिंग" : "100% Ethical Recycling"}
                </span>
              </div>
            </Link>
            <button 
              className="lg:hidden p-1 text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Mini Profile Card */}
          {user && (
            <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-750/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {user.name}
                    {user.verificationStatus === "verified" && (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate capitalize">{roleTitle}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const displayName = t(item.nameKey) || item.fallback;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    active 
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20" 
                      : "text-slate-300 hover:text-white hover:bg-slate-850/80"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active ? "text-slate-950" : "text-slate-400 group-hover:text-emerald-400")} />
                    <span className="truncate">{displayName}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0",
                      active ? "bg-slate-950/20 text-slate-950 font-bold" : "bg-slate-800 text-emerald-400 border border-emerald-500/20"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout & Quick Switch */}
        <div className="p-3 border-t border-slate-800 bg-[#090f17] space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t("nav.logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shadow-xs z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                {roleTitle}
                <span className="text-xs font-normal text-slate-400 hidden sm:inline">• ReCircle Fair Network</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Picker Voice Co-Pilot Button in Navbar */}
            {role === "picker" && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-safai-saathi"));
                  }
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 border border-emerald-400/30"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{lang === "hi" ? "🎙️ सफाई साथी" : "🎙️ Voice Saathi"}</span>
              </button>
            )}

            {/* Global Language Toggle in Navbar (Only for Pickers / Vernacular Roles) */}
            {role !== "generator" && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setLang("hi")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    lang === "hi" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  🇮🇳 हिन्दी
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                    lang === "en" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  English
                </button>
              </div>
            )}

            {/* Quick Persona Switcher for easy demo */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => login("g1")}
                className={cn("px-2 py-1 rounded-lg text-xs font-semibold transition-all", user?.id === "g1" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                Rajesh (Gen)
              </button>
              <button
                onClick={() => login("p1")}
                className={cn("px-2 py-1 rounded-lg text-xs font-semibold transition-all", user?.id === "p1" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                Suresh (Picker)
              </button>
              <button
                onClick={() => login("a1")}
                className={cn("px-2 py-1 rounded-lg text-xs font-semibold transition-all", user?.id === "a1" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900")}
              >
                Admin NGO
              </button>
            </div>

            {/* Wallet / Karma Pill */}
            {role === "picker" ? (
              <Link href="/picker/wallet" className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                <span>₹{user?.balance || 1450}</span>
              </Link>
            ) : (
              <Link href="/generator/leaderboard" className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                <Trophy className="h-3.5 w-3.5 text-amber-600" />
                <span>1,450 Green Pts</span>
              </Link>
            )}
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Role-Specific Intelligent AI Assistants */}
      {role === "generator" && <CitizenEcoBot />}
      {role === "picker" && <PickerVoiceSaathi />}
    </div>
  );
}
