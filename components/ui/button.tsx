import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-cyan-300/50 bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/20",
        variant === "secondary" && "border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.07]",
        variant === "danger" && "border-red-400/45 bg-red-500/10 text-red-100 hover:bg-red-500/15",
        className,
      )}
      {...props}
    />
  );
}
