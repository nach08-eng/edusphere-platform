import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users2, Wallet, ClipboardCheck, GraduationCap, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [{ title: "Dashboard — KMSS School Portal" }, { name: "robots", content: "noindex" }],
  }),
  component: DashboardPage,
});

type Profile = { full_name: string | null; email: string | null };
type RoleRow = { role: string };

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: prof }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      setProfile(prof as Profile | null);
      setRoles(((roleRows as RoleRow[] | null) ?? []).map((r) => r.role));
    })();
  }, [user.id]);

  const displayName = profile?.full_name || user.email || "there";
  const primaryRole = roles[0] ?? "student";

  const stats = [
    { label: "Total Students", value: "1,248", icon: Users2, accent: "text-brand-navy", trend: "+24 this term" },
    { label: "Attendance", value: "94.2%", icon: ClipboardCheck, accent: "text-emerald-600", trend: "+2.4% vs yesterday" },
    { label: "Fee Collection", value: "82%", icon: Wallet, accent: "text-brand-gold", trend: "₹4.2M collected" },
    { label: "Faculty", value: "85", icon: GraduationCap, accent: "text-brand-navy", trend: "12 departments" },
  ];

  return (
    <DashboardLayout user={{ email: user.email, full_name: profile?.full_name ?? null }}>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">
          Signed in as {primaryRole.replace(/_/g, " ")}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-navy">Welcome back, {displayName}.</h1>
        <p className="text-brand-navy/60 mt-2">Here's what's happening at KMSS today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-navy/5 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="size-9 bg-brand-sand rounded-md flex items-center justify-center text-brand-navy/60">
                <s.icon className="size-4" />
              </div>
              <ArrowUpRight className="size-4 text-brand-navy/30" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-[11px] text-brand-navy/50 mt-2">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-navy/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-brand-navy">Recent School Activities</h2>
            <button className="text-xs uppercase tracking-widest text-brand-navy/40 font-bold hover:text-brand-gold">View all</button>
          </div>
          <div className="space-y-3">
            {[
              { dot: "bg-brand-gold", text: "Annual Sports Meet — schedule finalized", time: "2h ago" },
              { dot: "bg-brand-navy/30", text: "Teacher Recruitment — Secondary department", time: "5h ago" },
              { dot: "bg-emerald-500", text: "Q1 Examination results published", time: "Yesterday" },
              { dot: "bg-brand-navy/30", text: "Science Lab — inventory updated", time: "2 days ago" },
              { dot: "bg-brand-gold", text: "Parent-Teacher Meeting — Grade 10", time: "3 days ago" },
            ].map((a) => (
              <div key={a.text} className="flex items-center justify-between py-3 border-b border-brand-navy/5 last:border-0">
                <div className="flex gap-3 items-center">
                  <div className={`size-2 rounded-full ${a.dot}`} />
                  <span className="text-sm text-brand-navy">{a.text}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand-navy/40">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-navy/5 p-6">
          <h2 className="font-bold text-brand-navy mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {[
              { date: "12", month: "Jul", title: "Sports Day", subtitle: "School grounds, 9 AM" },
              { date: "18", month: "Jul", title: "PTM Grade 9-10", subtitle: "Block A, all day" },
              { date: "25", month: "Jul", title: "Science Exhibition", subtitle: "Auditorium" },
            ].map((e) => (
              <div key={e.title} className="flex gap-4 items-center">
                <div className="shrink-0 w-12 text-center border border-brand-navy/10 rounded-md py-1">
                  <p className="text-lg font-bold text-brand-navy leading-none">{e.date}</p>
                  <p className="text-[10px] uppercase tracking-widest text-brand-navy/50">{e.month}</p>
                </div>
                <div>
                  <p className="font-medium text-brand-navy text-sm">{e.title}</p>
                  <p className="text-xs text-brand-navy/50">{e.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-brand-navy text-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl mb-1">More modules coming soon</h3>
          <p className="text-white/60 text-sm">
            Attendance, exams, fee management, LMS, library, transport, and hostel modules are being rolled out in phases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Phase 1</span>
          <span className="text-[10px] uppercase tracking-widest text-white/40">/ Auth & Foundation</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
