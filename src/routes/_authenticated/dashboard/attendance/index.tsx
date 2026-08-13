import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Radio, Users2, Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { classesQuery, classLabel, myRolesQuery } from "@/lib/students";
import {
  ATTENDANCE_STATUSES,
  PERIODS,
  classStudentsQuery,
  ensureSession,
  recentSessionsQuery,
  recordsQuery,
  sessionQuery,
  statusChip,
  statusStyles,
  today,
  type AttendanceStatus,
} from "@/lib/attendance";

export const Route = createFileRoute("/_authenticated/dashboard/attendance/")({
  head: () => ({
    meta: [
      { title: "Attendance — KMSS School Portal" },
      {
        name: "description",
        content: "Mark and monitor daily class attendance in real time at KMSS School Thiruppathur.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today());
  const [period, setPeriod] = useState<string>("Full Day");

  const classes = useQuery(classesQuery());
  const roles = useQuery(myRolesQuery(user.id));
  const canMark = (roles.data ?? []).some((r) =>
    ["super_admin", "principal", "teacher", "accountant"].includes(r),
  );

  useEffect(() => {
    if (!classId && (classes.data ?? []).length) setClassId(classes.data![0]!.id);
  }, [classes.data, classId]);

  const students = useQuery(classStudentsQuery(classId));
  const session = useQuery(sessionQuery(classId, date, period));
  const sessionId = session.data?.id ?? null;
  const records = useQuery(recordsQuery(sessionId));
  const recent = useQuery(recentSessionsQuery(classId));

  /* ---- realtime ---- */
  useEffect(() => {
    if (!classId) return;
    const channel = supabase
      .channel(`attendance-${classId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance_sessions", filter: `class_id=eq.${classId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["attendance-session", classId] });
          qc.invalidateQueries({ queryKey: ["attendance-recent", classId] });
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, () => {
        qc.invalidateQueries({ queryKey: ["attendance-records"] });
        qc.invalidateQueries({ queryKey: ["attendance-recent", classId] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, qc]);

  const byStudent = useMemo(() => {
    const m = new Map<string, AttendanceStatus>();
    (records.data ?? []).forEach((r) => m.set(r.student_id, r.status));
    return m;
  }, [records.data]);

  const roster = students.data ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 };
    roster.forEach((s) => {
      const st = byStudent.get(s.id);
      if (st) c[st] = (c[st] ?? 0) + 1;
      else c.unmarked = (c.unmarked ?? 0) + 1;
    });
    return c;
  }, [roster, byStudent]);

  const mark = useMutation({
    mutationFn: async (input: { studentId: string; status: AttendanceStatus }) => {
      const s = session.data ?? (await ensureSession(classId, date, period, user.id));
      const { error } = await supabase
        .from("attendance_records")
        .upsert(
          { session_id: s.id, student_id: input.studentId, status: input.status, marked_by: user.id },
          { onConflict: "session_id,student_id" },
        );
      if (error) throw error;
      return s.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-session", classId] });
      qc.invalidateQueries({ queryKey: ["attendance-records"] });
      qc.invalidateQueries({ queryKey: ["attendance-recent", classId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save attendance"),
  });

  const markAll = useMutation({
    mutationFn: async (status: AttendanceStatus) => {
      const s = session.data ?? (await ensureSession(classId, date, period, user.id));
      const rows = roster.map((st) => ({
        session_id: s.id,
        student_id: st.id,
        status,
        marked_by: user.id,
      }));
      if (!rows.length) return;
      const { error } = await supabase
        .from("attendance_records")
        .upsert(rows, { onConflict: "session_id,student_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Attendance updated");
      qc.invalidateQueries({ queryKey: ["attendance-session", classId] });
      qc.invalidateQueries({ queryKey: ["attendance-records"] });
      qc.invalidateQueries({ queryKey: ["attendance-recent", classId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save attendance"),
  });

  function exportCsv() {
    const cls = (classes.data ?? []).find((c) => c.id === classId);
    const header = ["Roll", "Admission No", "Name", "Status"];
    const lines = roster.map((s) =>
      [s.roll_no ?? "", s.admission_no, s.full_name, byStudent.get(s.id) ?? "unmarked"]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${cls ? `${cls.name}-${cls.section}` : "class"}-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout user={{ email: user.email, full_name: null }}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">Module</p>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-navy">Attendance</h1>
          <p className="text-brand-navy/60 mt-2 flex items-center gap-2">
            <Radio className="size-4 text-emerald-600" />
            Daily sessions with live updates across every device.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-brand-navy/15 bg-white text-sm font-medium text-brand-navy hover:bg-brand-sand self-start"
        >
          <Download className="size-4" /> Export register
        </button>
      </div>

      {/* Session picker */}
      <div className="bg-white rounded-xl border border-brand-navy/5 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          aria-label="Class"
          className="flex-1 px-3 py-2.5 rounded-sm border border-brand-navy/15 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
        >
          {(classes.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {classLabel(c)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Session date"
          className="px-3 py-2.5 rounded-sm border border-brand-navy/15 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Period"
          className="px-3 py-2.5 rounded-sm border border-brand-navy/15 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {canMark && (
          <button
            onClick={() => markAll.mutate("present")}
            disabled={markAll.isPending || !roster.length}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" /> Mark all present
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "On roll", value: roster.length, icon: Users2 },
          { label: "Present", value: counts.present ?? 0, icon: CheckCircle2 },
          { label: "Absent", value: counts.absent ?? 0, icon: CalendarDays },
          { label: "Late", value: counts.late ?? 0, icon: CalendarDays },
          { label: "Unmarked", value: counts.unmarked ?? 0, icon: CalendarDays },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-navy/5 p-5">
            <div className="size-9 bg-brand-sand rounded-md flex items-center justify-center text-brand-navy/60 mb-3">
              <s.icon className="size-4" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-navy">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Roster */}
      <div className="bg-white rounded-xl border border-brand-navy/5 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-brand-navy/5 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold">
            Register · {date} · {period}
          </p>
          {session.data && (
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700">
              Session open
            </span>
          )}
        </div>

        {students.isLoading && <p className="px-4 py-12 text-center text-brand-navy/50">Loading roster…</p>}
        {students.isError && (
          <p className="px-4 py-12 text-center text-red-600">You don't have permission to view attendance.</p>
        )}
        {!students.isLoading && !students.isError && !roster.length && (
          <p className="px-4 py-12 text-center text-brand-navy/50">No active students in this class yet.</p>
        )}

        <ul>
          {roster.map((s) => {
            const current = byStudent.get(s.id);
            return (
              <li
                key={s.id}
                className="px-4 py-3 border-b border-brand-navy/5 last:border-0 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="size-8 rounded-full bg-brand-sand text-brand-navy text-xs font-bold flex items-center justify-center shrink-0">
                    {s.roll_no ?? s.full_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-navy truncate">{s.full_name}</p>
                    <p className="text-xs text-brand-navy/40">{s.admission_no}</p>
                  </div>
                </div>

                {canMark ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ATTENDANCE_STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => mark.mutate({ studentId: s.id, status: st })}
                        aria-pressed={current === st}
                        className={`px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-widest font-bold transition-colors ${
                          current === st
                            ? statusStyles[st]
                            : "bg-brand-sand text-brand-navy/50 hover:text-brand-navy"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${
                      current ? statusChip[current] : "bg-brand-sand text-brand-navy/40"
                    }`}
                  >
                    {current ?? "unmarked"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-xl border border-brand-navy/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-navy/5">
          <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold">Recent sessions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold border-b border-brand-navy/5">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Marked</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
              </tr>
            </thead>
            <tbody>
              {(recent.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-brand-navy/50">
                    No attendance taken for this class yet.
                  </td>
                </tr>
              )}
              {(recent.data ?? []).map((s) => {
                const rs = s.attendance_records ?? [];
                return (
                  <tr key={s.id} className="border-b border-brand-navy/5 last:border-0">
                    <td className="px-4 py-3 text-brand-navy">{s.session_date}</td>
                    <td className="px-4 py-3 text-brand-navy/70">{s.period}</td>
                    <td className="px-4 py-3 text-brand-navy/70">{rs.length}</td>
                    <td className="px-4 py-3 text-emerald-700">{rs.filter((r) => r.status === "present").length}</td>
                    <td className="px-4 py-3 text-red-700">{rs.filter((r) => r.status === "absent").length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
