import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users2,
  GraduationCap,
  BookOpen,
  Wallet,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/students", label: "Students", icon: Users2 },
  { to: "/dashboard/teachers", label: "Teachers", icon: GraduationCap },
  { to: "/dashboard/academics", label: "Academics", icon: BookOpen },
  { to: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/dashboard/finance", label: "Finance", icon: Wallet },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
] as const;

export function DashboardLayout({
  children,
  user,
}: {
  children: ReactNode;
  user: { email?: string | null; full_name?: string | null };
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (user.full_name || user.email || "U")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-brand-sand flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-brand-navy/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-brand-navy/5 flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-brand-navy/5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 bg-brand-navy rounded flex items-center justify-center text-white font-serif text-lg">K</div>
            <div>
              <p className="font-serif font-bold text-brand-navy text-sm leading-tight">KMSS</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold">Admin Portal</p>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden text-brand-navy"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "flex items-center gap-3 px-3 py-2.5 bg-brand-navy text-white rounded-md text-sm font-medium"
                    : "flex items-center gap-3 px-3 py-2.5 text-brand-navy/60 hover:bg-brand-sand rounded-md text-sm font-medium transition-colors"
                }
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-navy/5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="size-9 rounded-full bg-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-gold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-navy truncate">{user.full_name || user.email}</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-navy/40">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-brand-navy/60 hover:bg-brand-sand rounded-md transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-brand-navy/5 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-brand-navy"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold text-brand-navy hidden sm:inline">
              KMSS School • Thiruppathur
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-9 rounded-full hover:bg-brand-sand flex items-center justify-center text-brand-navy/60">
              <Bell className="size-4" />
            </button>
            <button className="size-9 rounded-full hover:bg-brand-sand flex items-center justify-center text-brand-navy/60">
              <Settings className="size-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
