"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage, Language } from "@/lib/language-context";
import { usePlatformData } from "@/lib/platform-data-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, CalendarPlus, Recycle, DollarSign, Heart, CreditCard, User, HelpCircle,
  Map, CheckSquare, MapPin, Banknote, Wallet, Award, Trophy,
  Users, Trash2, BarChart3, AlertTriangle, FileText, Settings, LogOut, Menu, X,
  ShieldCheck, Sparkles, Bell, Bot, CheckCheck
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import CitizenEcoBot from "@/components/CitizenEcoBot";
import PickerVoiceSaathi from "@/components/PickerVoiceSaathi";
import { formatCurrency } from "@/lib/formatters";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "pickup" | "price" | "karma" | "system" | "dispute";
}

const NOTIFICATIONS_BY_ROLE: Record<string, NotificationItem[]> = {
  generator: [
    {
      id: "gen_1",
      title: "Doorstep Pickup Scheduled 📦",
      description: "Safai Mitra Suresh is assigned for 10 Oct at 10:00 AM.",
      time: "10m ago",
      read: false,
      type: "pickup",
    },
    {
      id: "gen_2",
      title: "+50 Green Karma Points! 🌟",
      description: "Your segregated PET bottle batch was verified and rewarded.",
      time: "2h ago",
      read: false,
      type: "karma",
    },
    {
      id: "gen_3",
      title: "Fair Scrap Price Updated 📈",
      description: "Cardboard benchmark rose to ₹14.50/kg today.",
      time: "5h ago",
      read: false,
      type: "price",
    },
  ],
  picker: [
    {
      id: "pic_1",
      title: "High-Value Pickup Nearby (0.4 km) ⚡",
      description: "12 kg Cardboard ready at Indiranagar (₹174 guaranteed payout).",
      time: "5m ago",
      read: false,
      type: "pickup",
    },
    {
      id: "pic_2",
      title: "₹450 Direct UPI Credited 💰",
      description: "Completed morning commercial paper pickup. 0% commission.",
      time: "3h ago",
      read: false,
      type: "price",
    },
  ],
  admin: [
    {
      id: "adm_1",
      title: "Arbitration Case Escalated ⚖️",
      description: "Anjali Gupta raised weight discrepancy on Order #req1.",
      time: "15m ago",
      read: false,
      type: "dispute",
    },
    {
      id: "adm_2",
      title: "New Picker KYC Verified 👥",
      description: "Ramesh certified with Aadhaar and Aadhaar-linked UPI wallet.",
      time: "1h ago",
      read: false,
      type: "system",
    },
    {
      id: "adm_3",
      title: "Gini Index Improved 📊",
      description: "Income inequality dropped to 0.28 across Ward 150.",
      time: "4h ago",
      read: false,
      type: "karma",
    },
    {
      id: "adm_4",
      title: "Price Floor Compliance 100% 🛡️",
      description: "All 42 daily pickups met or exceeded fair benchmark rates.",
      time: "6h ago",
      read: false,
      type: "price",
    },
  ],
};

export default function SidebarLayout({ children, role }: { children: React.ReactNode, role: string }) {
  const { user, login, logout } = useAuth();
  const { users } = usePlatformData();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => NOTIFICATIONS_BY_ROLE[role] || NOTIFICATIONS_BY_ROLE.generator);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(NOTIFICATIONS_BY_ROLE[role] || NOTIFICATIONS_BY_ROLE.generator);
  }, [role, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      { nameKey: "nav.payments", fallback: "Payments & Receipts", href: "/generator/payments", icon: CreditCard },
      { nameKey: "nav.profile", fallback: "My Profile", href: "/generator/profile", icon: User },
      { nameKey: "nav.help", fallback: "Help & Segregation Guide", href: "/generator/help", icon: HelpCircle },
    ],
    picker: [
      { nameKey: "nav.dashboard", fallback: "Dashboard", href: "/picker/dashboard", icon: LayoutDashboard },
      { nameKey: "nav.nearby", fallback: "Nearby Radar", href: "/picker/nearby-requests", icon: Map, badge: "Live" },
      { nameKey: "nav.myjobs", fallback: "My Jobs", href: "/picker/my-pickups", icon: CheckSquare },
      { nameKey: "nav.route", fallback: "Route & Strain", href: "/picker/route-planner", icon: MapPin, badge: "Slope" },
      { nameKey: "nav.wallet", fallback: "Earnings & Wallet", href: "/picker/wallet", icon: Wallet },
      { nameKey: "nav.benefits", fallback: "Benefits & Karma", href: "/picker/benefits", icon: Award, badge: "782 ⭐" },
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
    ? (lang === "hi" ? "नागरिक पोर्टल (Citizen)" : lang === "kn" ? "ಪೌರ ಪೋರ್ಟಲ್" : "Citizen Generator")
    : role === "picker" 
    ? (lang === "hi" ? "सफाई मित्र साथी (Waste-Picker)" : lang === "kn" ? "ಸಫಾಯಿ ಮಿತ್ರ ಸಹಾಯಕ" : "Waste-Picker Partner")
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
                  {lang === "hi" ? "100% निष्पक्ष रीसाइक्लिंग" : "Ethical Recycling Network"}
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
            {/* Global Language Toggle in Navbar (Active for Generator, Picker & Admin) */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLang("hi")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                  lang === "hi" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang("kn")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                  lang === "kn" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLang("en")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                  lang === "en" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                )}
              >
                EN
              </button>
            </div>

            {/* Quick Persona Switcher for easy demo */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 px-1.5 font-mono">Demo:</span>
              <button
                onClick={() => login("g1")}
                className={cn("px-2 py-1 rounded-lg text-xs font-semibold transition-all", user?.id === "g1" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900")}
              >
                Rajesh (Gen)
              </button>
              <button
                onClick={() => login("p1")}
                className={cn("px-2 py-1 rounded-lg text-xs font-semibold transition-all", user?.id === "p1" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900")}
              >
                Suresh (Picker)
              </button>
              <button
                onClick={() => login("a1")}
                className={cn("px-2 py-1 rounded-lg text-xs font-semibold transition-all", user?.id === "a1" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900")}
              >
                Admin NGO
              </button>
            </div>

            {/* Picker Voice Co-Pilot Button */}
            {role === "picker" && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-safai-saathi"));
                  }
                }}
                title="Open Safai Saathi Voice Assistant"
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 border border-emerald-400/30"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{lang === "hi" ? "🎙️ सफाई साथी" : "🎙️ Voice Saathi"}</span>
              </button>
            )}

            {/* ReCircle EcoBot Icon Button (Only for Citizen / Generator) */}
            {role === "generator" && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("toggle-citizen-ecobot"));
                  }
                }}
                title="Open ReCircle AI EcoBot"
                className="relative flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 border border-emerald-400/30"
              >
                <Bot className="h-4 w-4 text-emerald-200" />
                <span className="hidden md:inline">EcoBot</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </button>
            )}

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                title="Notifications"
                className={cn(
                  "relative p-2 rounded-xl border text-slate-600 hover:text-slate-900 transition-all",
                  notificationsOpen 
                    ? "bg-slate-100 border-slate-300 text-slate-900 shadow-inner" 
                    : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white font-black text-[9px] shadow-xs border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                        }}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/80 px-2 py-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                            );
                          }}
                          className={cn(
                            "p-3 rounded-xl transition-colors cursor-pointer flex gap-3 text-left mt-1",
                            item.read ? "bg-white hover:bg-slate-50" : "bg-emerald-50/50 hover:bg-emerald-50"
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                            item.type === "pickup" ? "bg-emerald-100 text-emerald-700" :
                            item.type === "karma" ? "bg-amber-100 text-amber-700" :
                            item.type === "price" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                          )}>
                            {item.type === "pickup" ? "📦" : item.type === "karma" ? "🌟" : item.type === "price" ? "📈" : "🔔"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={cn("text-xs font-bold truncate", item.read ? "text-slate-800" : "text-emerald-950")}>
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          </div>
                          {!item.read && (
                            <div className="h-2 w-2 rounded-full bg-emerald-500 self-center shrink-0"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-medium">
                      ReCircle Fair AI Real-Time Dispatch System
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Role-Specific Metric Pill with Real-Time Reactive State */}
            {role === "picker" ? (
              <Link href="/picker/wallet" className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-2xs">
                <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                <span>{formatCurrency((users.find(u => u.id === user?.id || u.role === "picker")?.balance) ?? (user?.balance || 1450))} (UPI Wallet)</span>
              </Link>
            ) : role === "generator" ? (
              <Link href="/generator/leaderboard" className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-2xs">
                <Trophy className="h-3.5 w-3.5 text-amber-600" />
                <span>{((users.find(u => u.id === user?.id || u.role === "generator")?.greenKarmaPoints) ?? 1450).toLocaleString()} Green Karma</span>
              </Link>
            ) : (
              <Link href="/admin/fairness-analytics" className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                <span>Ward 150 NGO Active</span>
              </Link>
            )}
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className={cn("flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f8fafc]", role === "picker" && "pb-24 md:pb-8")}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Role-Specific Intelligent AI Assistants */}
      {role === "generator" && <CitizenEcoBot />}
      {role === "picker" && <PickerVoiceSaathi />}

      {/* Mobile Bottom Navigation Bar for Waste Pickers (Below 768px / md:hidden) */}
      {role === "picker" && (
        <nav 
          aria-label="Mobile Bottom Navigation" 
          className="md:hidden fixed bottom-0 inset-x-0 bg-[#0c141d] border-t border-slate-800 z-40 px-2 py-1 flex items-center justify-around shadow-2xl safe-area-bottom"
        >
          <Link
            href="/picker/dashboard"
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all",
              pathname === "/picker/dashboard" ? "text-emerald-400 font-bold bg-slate-850" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <LayoutDashboard className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t("tab.home")}</span>
          </Link>

          <Link
            href="/picker/nearby-requests"
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all",
              (pathname === "/picker/nearby-requests" || pathname === "/picker/my-pickups" || pathname === "/picker/route-planner")
                ? "text-emerald-400 font-bold bg-slate-850"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Map className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t("tab.jobs")}</span>
          </Link>

          <Link
            href="/picker/wallet"
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all",
              (pathname === "/picker/wallet" || pathname === "/picker/earnings")
                ? "text-emerald-400 font-bold bg-slate-850"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Wallet className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t("tab.wallet")}</span>
          </Link>

          <Link
            href="/picker/benefits"
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all",
              (pathname === "/picker/benefits" || pathname === "/picker/karma-credit" || pathname === "/picker/health-pool")
                ? "text-emerald-400 font-bold bg-slate-850"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Award className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t("tab.benefits")}</span>
          </Link>

          <Link
            href="/picker/profile"
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[48px] px-2 py-1 rounded-xl transition-all",
              pathname === "/picker/profile" ? "text-emerald-400 font-bold bg-slate-850" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <User className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-bold">{t("tab.profile")}</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
