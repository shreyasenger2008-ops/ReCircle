import { ReactNode } from "react";
import SidebarLayout from "@/components/SidebarLayout";

export default function GeneratorLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout role="generator">{children}</SidebarLayout>;
}