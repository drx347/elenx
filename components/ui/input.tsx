import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10",
        className,
      )}
      {...props}
    />
  );
}
