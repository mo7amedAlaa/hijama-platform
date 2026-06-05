import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1C1C1A] dark:bg-[#0A0F1E] dark:text-[#E8EDF5] transition-colors duration-300">
        <WhatsAppButton />
      <Navbar />
      <main className="">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;