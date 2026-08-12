import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, MapPin, CalendarDays, Droplet, IdCard } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { studentQuery, classLabel } from "@/lib/students";

export const Route = createFileRoute("/_authenticated/dashboard/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student profile — KMSS School Portal" },
      { name: "description", content: "Full student profile, class allocation, and guardian contact details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentDetailPage,
});

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  alumni: "bg-brand-navy/5 text-brand-navy/70",
  transferred: "bg-amber-50 text-amber-700",
  suspended: "bg-red-50 text-red-700",
};

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start py-3 border-b border-brand-navy/5 last:border-0">
      <Icon className="size-4 text-brand-navy/30 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold">{label}</p>
        <p className="text-sm text-brand-navy">{value || "—"}</p>
      </div>
    </div>
  );
}

function StudentDetailPage() {
  const { studentId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: s, isLoading, isError } = useQuery(studentQuery(studentId));

  return (
    <DashboardLayout user={{ email: user.email, full_name: null }}>
      <Link
        to="/dashboard/students"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy/50 hover:text-brand-gold mb-6"
      >
        <ArrowLeft className="size-4" /> All students
      </Link>

      {isLoading && <p className="text-brand-navy/50">Loading profile…</p>}
      {isError && <p className="text-red-600">You don't have permission to view this record.</p>}
      {!isLoading && !isError && !s && <p className="text-brand-navy/50">Student not found.</p>}

      {s && (
        <>
          <div className="bg-white rounded-xl border border-brand-navy/5 p-6 md:p-8 mb-6 flex flex-col sm:flex-row gap-6 sm:items-center">
            <div className="size-20 rounded-full bg-brand-sand text-brand-navy font-serif text-2xl flex items-center justify-center shrink-0">
              {s.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-3xl text-brand-navy">{s.full_name}</h1>
              <p className="text-brand-navy/60 mt-1">
                {classLabel(s.classes)}
                {s.roll_no ? ` · Roll #${s.roll_no}` : ""} · {s.admission_no}
              </p>
            </div>
            <span
              className={`self-start text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded ${statusStyles[s.status] ?? ""}`}
            >
              {s.status}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-brand-navy/5 p-6">
              <h2 className="font-bold text-brand-navy mb-2">Student details</h2>
              <Row icon={IdCard} label="Admission number" value={s.admission_no} />
              <Row icon={CalendarDays} label="Date of birth" value={s.date_of_birth ?? ""} />
              <Row icon={IdCard} label="Gender" value={s.gender ?? ""} />
              <Row icon={Droplet} label="Blood group" value={s.blood_group ?? ""} />
              <Row icon={CalendarDays} label="Admitted on" value={s.admission_date} />
            </div>

            <div className="bg-white rounded-xl border border-brand-navy/5 p-6">
              <h2 className="font-bold text-brand-navy mb-2">Guardian & contact</h2>
              <Row icon={IdCard} label="Guardian" value={s.guardian_name ?? ""} />
              <Row icon={Phone} label="Phone" value={s.guardian_phone ?? ""} />
              <Row icon={Mail} label="Email" value={s.guardian_email ?? ""} />
              <Row icon={MapPin} label="Address" value={s.address ?? ""} />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
