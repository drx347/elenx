import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScannerConsole from "@/components/scanner/ScannerConsole";

export default function ScannerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <ScannerConsole />
      </main>
      <Footer />
    </div>
  );
}
