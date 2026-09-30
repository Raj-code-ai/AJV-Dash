import { ReactNode } from "react";
import { FiInbox } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "Nothing here yet",
  description = "Content will appear once it is added by the department admin.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-academic-navy/5 text-academic-teal dark:bg-white/5">
        {icon || <FiInbox className="h-6 w-6" />}
      </div>
      <h3 className="font-display text-xl font-semibold text-academic-navy dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
