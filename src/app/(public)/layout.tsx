import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitTracker from "@/components/visitors/VisitTracker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell flex min-h-screen flex-col">
      <VisitTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
