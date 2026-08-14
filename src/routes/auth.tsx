import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — KMSS School Portal" },
      { name: "description", content: "Sign in to the KMSS School portal for students, parents, teachers, and administrators." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") && !search.next.startsWith("//")
      ? search.next
      : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const redirectTo = next ?? "/dashboard";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ href: redirectTo, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ href: redirectTo, replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${redirectTo}`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
    // redirect or session set by lovable.auth
  }

  return (
    <div className="min-h-screen flex bg-brand-sand">
      <div className="hidden lg:flex flex-1 bg-brand-navy text-white p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-10 bg-white text-brand-navy rounded flex items-center justify-center font-serif text-xl">K</div>
          <span className="font-serif font-bold text-xl">KMSS <span className="text-brand-gold">School</span></span>
        </Link>
        <div>
          <h2 className="font-serif text-4xl leading-tight mb-6 max-w-md">
            One portal for the entire school community.
          </h2>
          <p className="text-white/60 max-w-md leading-relaxed">
            Students, parents, teachers, and administrators — sign in to attendance, fees, academics, and more.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-white/40">© 2024 KMSS Thiruppathur</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="size-10 bg-brand-navy text-white rounded flex items-center justify-center font-serif text-xl">K</div>
            <span className="font-serif font-bold text-xl text-brand-navy">KMSS <span className="text-brand-gold">School</span></span>
          </Link>

          <h1 className="font-serif text-3xl text-brand-navy mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-brand-navy/60 mb-8">
            {mode === "signin" ? "Sign in to access your portal." : "Get started with KMSS School."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full border border-brand-navy/15 bg-white py-3 rounded-sm font-medium text-brand-navy hover:bg-brand-sand transition-colors mb-6 flex items-center justify-center gap-3"
          >
            <svg className="size-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C40.5 36 44 30.6 44 24c0-1.3-.1-2.5-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-brand-navy/10" />
            <span className="text-xs text-brand-navy/40 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-brand-navy/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Full name</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 bg-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Email</label>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 bg-white focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Password</label>
              <input
                required
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 bg-white focus:outline-none focus:border-brand-gold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-navy text-white py-3 rounded-sm font-semibold hover:bg-brand-navy/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-brand-navy/60 mt-6 text-center">
            {mode === "signin" ? "New to KMSS? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-brand-gold font-semibold hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
