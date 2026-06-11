import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/$module")({
  head: ({ params }) => ({
    meta: [{ title: `${params.module} — KMSS Portal` }, { name: "robots", content: "noindex" }],
  }),
  component: ModulePage,
});

const titles: Record<string, { title: string; desc: string }> = {
  students: { title: "Students", desc: "Manage student profiles, admissions, transfers, and history." },
  teachers: { title: "Teachers", desc: "Faculty profiles, subject assignments, and performance." },
  academics: { title: "Academics", desc: "Classes, sections, subjects, and timetables." },
  attendance: { title: "Attendance", desc: "Daily and subject-wise attendance tracking." },
  finance: { title: "Finance", desc: "Fee categories, collection, receipts, and dues." },
  reports: { title: "Reports", desc: "Analytics, exports, and downloadable reports." },
};

type Profile = { full_name: string | null; email: string | null };

function ModulePage() {
  const { module } = Route.useParams();
  const { user } = Route.useRouteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const meta = titles[module] ?? { title: module, desc: "Module coming soon." };

  useEffect(() => {
    supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data as Profile | null));
  }, [user.id]);

  return (
    <DashboardLayout user={{ email: user.email, full_name: profile?.full_name ?? null }}>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">Module</p>
        <h1 className="font-serif text-3xl md:text-4xl text-brand-navy capitalize">{meta.title}</h1>
        <p className="text-brand-navy/60 mt-2 max-w-2xl">{meta.desc}</p>
      </div>

      <div className="bg-white rounded-xl border border-brand-navy/5 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="size-16 rounded-full bg-brand-sand flex items-center justify-center mb-6">
          <div className="size-3 rounded-full bg-brand-gold animate-pulse" />
        </div>
        <h2 className="font-serif text-2xl text-brand-navy mb-3">Coming in Phase 2</h2>
        <p className="text-brand-navy/60 max-w-md leading-relaxed">
          This module will be built out next. The foundation — authentication, role-based access, and platform shell — is in place.
        </p>
      </div>
    </DashboardLayout>
  );
}
