import { Outlet } from "react-router-dom";
import MobileNav from "./MobileNav";
import AppHeader from "./AppHeader";
import QuickActionFAB from "./QuickActionFAB";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <AppHeader />
      <main className="pb-20 min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
      <QuickActionFAB />
      <MobileNav />
    </div>
  );
}