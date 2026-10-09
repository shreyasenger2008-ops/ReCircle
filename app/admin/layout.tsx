import { ReactNode } from "react";
import SidebarLayout from "@/components/SidebarLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout role="admin">{children}</SidebarLayout>;
}