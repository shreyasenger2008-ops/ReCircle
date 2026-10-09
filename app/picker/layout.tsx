import { ReactNode } from "react";
import SidebarLayout from "@/components/SidebarLayout";

export default function PickerLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout role="picker">{children}</SidebarLayout>;
}