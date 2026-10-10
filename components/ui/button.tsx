import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
          {
            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-xs": variant === "destructive",
            "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900 shadow-2xs font-bold": variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold": variant === "secondary",
            "hover:bg-slate-100 text-slate-700 hover:text-slate-900": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-11 rounded-xl px-6": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
