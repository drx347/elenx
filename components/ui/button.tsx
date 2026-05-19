import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded border px-4 py-2 text-sm font-semibold transition duration-200 before:absolute before:inset-y-0 before:left-[-45%] before:w-1/3 before:skew-x-[-18deg] before:bg-white/15 before:opacity-0 before:transition before:duration-300 hover:-translate-y-0.5 hover:before:left-[120%] hover:before:opacity-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        variant === "primary" && "border-cyan-300/50 bg-cyan-400/15 text-cyan-50 shadow-[0_0_26px_rgba(0,229,255,0.08)] hover:bg-cyan-400/20",
        variant === "secondary" && "border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.07]",
        variant === "danger" && "border-red-400/45 bg-red-500/10 text-red-100 hover:bg-red-500/15",
        className,
      )}
      {...props}
    />
  );
}
