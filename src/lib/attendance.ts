import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type AttendanceSession = Tables<"attendance_sessions">;
export type AttendanceRecord = Tables<"attendance_records">;
export type AttendanceStatus = AttendanceRecord["status"];

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;

export const statusStyles: Record<AttendanceStatus, string> = {
  present: "bg-emerald-600 text-white",
  absent: "bg-red-600 text-white",
  late: "bg-amber-500 text-white",
  excused: "bg-brand-navy text-white",
};

export const statusChip: Record<AttendanceStatus, string> = {
  present: "bg-emerald-50 text-emerald-700",
  absent: "bg-red-50 text-red-700",
  late: "bg-amber-50 text-amber-700",
  excused: "bg-brand-navy/5 text-brand-navy/70",
};

export const PERIODS = ["Full Day", "Period 1", "Period 2", "Period 3", "Period 4", "Period 5"] as const;

export const today = () => new Date().toISOString().slice(0, 10);

export const classStudentsQuery = (classId: string) => ({
  queryKey: ["attendance-students", classId],
  enabled: !!classId,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, admission_no, roll_no")
      .eq("class_id", classId)
      .eq("status", "active")
      .order("roll_no", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const sessionQuery = (classId: string, date: string, period: string) => ({
  queryKey: ["attendance-session", classId, date, period],
  enabled: !!classId && !!date,
  queryFn: async (): Promise<AttendanceSession | null> => {
    const { data, error } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("class_id", classId)
      .eq("session_date", date)
      .eq("period", period)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const recordsQuery = (sessionId: string | null | undefined) => ({
  queryKey: ["attendance-records", sessionId],
  enabled: !!sessionId,
  queryFn: async (): Promise<AttendanceRecord[]> => {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", sessionId as string);
    if (error) throw error;
    return data ?? [];
  },
});

export const recentSessionsQuery = (classId: string) => ({
  queryKey: ["attendance-recent", classId],
  enabled: !!classId,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("attendance_sessions")
      .select("*, attendance_records(status)")
      .eq("class_id", classId)
      .order("session_date", { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data ?? []) as (AttendanceSession & { attendance_records: { status: AttendanceStatus }[] })[];
  },
});

export type AuditEntry = Tables<"attendance_audit_log"> & {
  student_name: string | null;
  changed_by_name: string | null;
};

export const auditLogQuery = (sessionId: string | null | undefined) => ({
  queryKey: ["attendance-audit", sessionId],
  enabled: !!sessionId,
  queryFn: async (): Promise<AuditEntry[]> => {
    const { data, error } = await supabase
      .from("attendance_audit_log")
      .select("*")
      .eq("session_id", sessionId as string)
      .order("changed_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) return [];

    const studentIds = [...new Set(rows.map((r) => r.student_id))];
    const actorIds = [...new Set(rows.map((r) => r.changed_by).filter(Boolean))] as string[];

    const [{ data: students }, { data: actors }] = await Promise.all([
      supabase.from("students").select("id, full_name").in("id", studentIds),
      actorIds.length
        ? supabase.from("profiles").select("id, full_name, email").in("id", actorIds)
        : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
    ]);

    const studentMap = new Map((students ?? []).map((s) => [s.id, s.full_name]));
    const actorMap = new Map((actors ?? []).map((p) => [p.id, p.full_name || p.email]));

    return rows.map((r) => ({
      ...r,
      student_name: studentMap.get(r.student_id) ?? null,
      changed_by_name: r.changed_by ? (actorMap.get(r.changed_by) ?? null) : null,
    }));
  },
});

export const auditActionLabel: Record<string, string> = {
  marked: "Marked",
  changed: "Changed",
  removed: "Removed",
};

export const formatAuditTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export async function ensureSession(classId: string, date: string, period: string, userId: string) {
  const { data: existing, error: selErr } = await supabase
    .from("attendance_sessions")
    .select("*")
    .eq("class_id", classId)
    .eq("session_date", date)
    .eq("period", period)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("attendance_sessions")
    .insert({ class_id: classId, session_date: date, period, taken_by: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
