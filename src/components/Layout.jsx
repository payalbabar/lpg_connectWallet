import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Link2, Wallet, ClipboardList,
  Database, Menu, Flame, ChevronRight, LogOut, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/metrics", label: "Metrics", icon: LayoutDashboard },
  { path: "/book", label: "Book Cylinder", icon: ShoppingCart },
  { path: "/bookings", label: "My Bookings", icon: ClipboardList },
  { path: "/supply-chain", label: "Supply Chain", icon: Link2 },
  { path: "/subsidies", label: "Subsidies", icon: Wallet },
  { path: "/ledger", label: "Blockchain Ledger", icon: Database },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-sidebar flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">GasChain</h1>
            <p className="text-[10px] text-sidebar-foreground/50 font-mono uppercase tracking-widest">LPG Connect</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-sidebar-accent">
          <p className="text-[10px] font-mono text-sidebar-foreground/40 uppercase tracking-wider mb-1">Network Status</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-xs text-sidebar-foreground/70 font-medium">Chain Active • 12 Nodes</span>
          </div>
        </div>

        {/* Sidebar User Info (Mobile) */}
        <div className="lg:hidden p-4 border-t border-sidebar-foreground/10">
          <div className="flex items-center gap-3 mb-3">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
             </div>
             <div className="min-w-0">
                <p className="text-xs font-bold text-sidebar-foreground truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-sidebar-foreground/40">Connected</p>
             </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50 px-8 py-4 items-center justify-between">
          <div>
             <h2 className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">
               {navItems.find(i => i.path === location.pathname)?.label || "Overview"}
             </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                   <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left leading-none pr-2">
                   <p className="text-xs font-bold truncate max-w-[150px]">{user?.name || "Demo User"}</p>
                   <p className="text-[9px] text-muted-foreground mt-0.5">Blockchain Identity</p>
                </div>
             </div>
             <button 
               onClick={() => logout()}
               className="h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 text-muted-foreground"
               title="Sign Out"
             >
               <LogOut className="h-4 w-4" />
             </button>
          </div>
        </header>

        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-muted">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">GasChain</span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
             <User className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
