import type { ReactNode } from "react";
import Footer from "./Footer";
import Navigation from "./Navigation";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
