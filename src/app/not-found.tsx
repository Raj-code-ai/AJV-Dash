import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-academic-teal">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-academic-navy dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
