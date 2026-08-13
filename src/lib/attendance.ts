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
