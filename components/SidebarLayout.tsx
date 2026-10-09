"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, CalendarPlus, Recycle, DollarSign, Heart, CreditCard, User, HelpCircle,
  Map, CheckSquare, MapPin, Banknote, Wallet, 
  Users, Trash2, BarChart3, AlertTriangle, FileText, Settings, LogOut, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type RouteItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const ROUTES: Record<string, RouteItem[]> = {
  generator: [
    { name: "Dashboard", href: "/generator/dashboard", icon: LayoutDashboard },
    { name: "Schedule Pickup", href: "/generator/schedule-pickup", icon: CalendarPlus },
    { name: "My Pickups", href: "/generator/my-pickups", icon: Recycle },
    { name: "Fair Price Board", href: "/generator/fair-price-board", icon: DollarSign },
    { name: "Impact", href: "/generator/impact", icon: Heart },
    { name: "Payments", href: "/generator/payments", icon: CreditCard },
    { name: "Profile", href: "/generator/profile", icon: User },
    { name: "Help", href: "/generator/help", icon: HelpCircle },
  ],
  picker: [
    { name: "Dashboard", href: "/picker/dashboard", icon: LayoutDashboard },
    { name: "Nearby Requests", href: "/picker/nearby-requests", icon: Map },
    { name: "My Pickups", href: "/picker/my-pickups", icon: CheckSquare },
    { name: "Route Planner", href: "/picker/route-planner", icon: MapPin },
    { name: "Earnings", href: "/picker/earnings", icon: Banknote },
    { name: "Wallet", href: "/picker/wallet", icon: Wallet },
    { name: "Profile", href: "/picker/profile", icon: User },
    { name: "Help", href: "/picker/help", icon: HelpCircle },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Pickups", href: "/admin/pickups", icon: Trash2 },
    { name: "Fairness Analytics", href: "/admin/fairness-analytics", icon: BarChart3 },
    { name: "Disputes", href: "/admin/disputes", icon: AlertTriangle },
    { name: "Price Board", href: "/admin/price-board", icon: DollarSign },
    { name: "Impact Reports", href: "/admin/impact-reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]
};

export default function SidebarLayout({ children, role }: { children: React.ReactNode, role: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Since we rely on localstorage, user might not be immediately available on mount if using ssr.
  // AuthContext handles it, but we add a safety check.
  useEffect(() => {
    if (user && user.role !== role) {
      router.push(`/${user.role}/dashboard`);
    } else if (user === null) {
      // In a real app we'd redirect to login immediately if unauthenticated, 
      // but for mock data during hydration, we might want a brief delay or handle loading state.
      // For this demo, let's just make sure user isn't null after mount
      const saved = localStorage.getItem("mock_user_id");
      if (!saved) {
        router.push("/login");
      }
    }
  }, [user, role, router]);

  const navItems = ROUTES[role] || [];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <Recycle className="h-8 w-8 text-green-600" />
            <span className="font-bold text-xl text-slate-900">ReCircle</span>
          </Link>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-green-50 text-green-700" 
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}>
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              className="mr-4 lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900 capitalize hidden sm:block">
              {role} Portal
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm">
                  <span className="text-slate-500">Balance: </span>
                  <span className="font-semibold text-green-600">₹{user.balance.toFixed(2)}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                  {user.name.charAt(0)}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
