"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { Recycle } from "lucide-react";
import { useRouter } from "next/navigation";

// Next.js specific dynamic Link
import NextLink from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <NextLink href="/" className="flex items-center gap-2">
              <Recycle className="h-8 w-8 text-green-600" />
              <span className="font-bold text-xl text-slate-900">ReCircle Fair</span>
            </NextLink>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm font-medium text-slate-700">
                  Welcome, {user.name} ({user.role})
                </div>
                <div className="text-sm font-semibold text-green-600">
                  Balance: ${user.balance.toFixed(2)}
                </div>
                <NextLink href={`/dashboard/${user.role}`}>
                  <Button variant="outline" size="sm">Dashboard</Button>
                </NextLink>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <NextLink href="/login">
                <Button size="sm">Login</Button>
              </NextLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
