import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  success:
    "bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  warning:
    "bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  danger: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  info: "bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export default function Badge({
  className,
  tone = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
