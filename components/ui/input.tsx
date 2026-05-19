import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded border border-white/10 bg-[#0b0b0b]/90 px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-zinc-600 hover:border-white/20 focus:border-cyan-300/70 focus:bg-[#0f1212] focus:ring-2 focus:ring-cyan-300/10",
        className,
      )}
      {...props}
    />
  );
}
