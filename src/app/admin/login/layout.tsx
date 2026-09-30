import { Suspense } from "react";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="page-shell min-h-screen" />}>{children}</Suspense>;
}
