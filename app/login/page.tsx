"use client";

import { useAuth } from "@/lib/auth-context";
import { MOCK_USERS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User as UserIcon, Truck, ShieldCheck, Leaf } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const handleLogin = (id: string) => {
    login(id);
  };

  const getIcon = (role: string) => {
    switch (role) {
      case "generator": return <UserIcon className="mr-3 h-5 w-5 text-blue-500" />;
      case "picker": return <Truck className="mr-3 h-5 w-5 text-green-500" />;
      case "admin": return <ShieldCheck className="mr-3 h-5 w-5 text-purple-500" />;
      default: return <UserIcon className="mr-3 h-5 w-5" />;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4 -mt-10">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Select Demo Persona</CardTitle>
          <CardDescription className="text-base">Experience the platform from any perspective.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-10 px-8">
          {MOCK_USERS.map((u) => (
            <Button
              key={u.id}
              onClick={() => handleLogin(u.id)}
              className="w-full justify-start h-14 text-base border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              variant="outline"
            >
              {getIcon(u.role)}
              <div className="flex flex-col items-start">
                <span className="font-bold text-slate-900">{u.name}</span>
                <span className="text-xs text-slate-500 capitalize">Role: {u.role === 'admin' ? 'Admin / NGO' : u.role}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
