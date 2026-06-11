import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions", label: "Admissions" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-navy/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-10 bg-brand-navy rounded flex items-center justify-center text-white font-serif text-xl">
            K
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-brand-navy">
            KMSS <span className="text-brand-gold">School</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "text-brand-gold border-b-2 border-brand-gold pb-0.5"
                    : "text-brand-navy/80 hover:text-brand-gold transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden md:inline-flex bg-brand-navy text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-navy/90 transition-all"
          >
            Portal Login
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 text-brand-navy"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden mt-4 pb-2 border-t border-brand-navy/5 pt-4 space-y-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block text-sm font-medium uppercase tracking-wider text-brand-navy/80 hover:text-brand-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="block bg-brand-navy text-white px-4 py-2.5 rounded-sm text-sm font-medium text-center mt-3"
          >
            Portal Login
          </Link>
        </div>
      )}
    </nav>
  );
}
