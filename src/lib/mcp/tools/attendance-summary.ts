import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "attendance_summary",
  title: "Attendance summary",
  description:
    "Summarise attendance for a class on a given date (counts of present, absent, late, excused) with per-student rows.",
  inputSchema: {
    class_id: z.string().uuid().describe("Class to summarise."),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Session date in YYYY-MM-DD format."),
    period: z.string().trim().optional().describe("Period label, e.g. 'Full Day'. Defaults to all periods."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ class_id, date, period }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let sessionQuery = supabase
      .from("attendance_sessions")
      .select("id, period, notes")
      .eq("class_id", class_id)
      .eq("session_date", date);
    if (period) sessionQuery = sessionQuery.eq("period", period);

    const { data: sessions, error: sessionError } = await sessionQuery;
    if (sessionError) return { content: [{ type: "text", text: sessionError.message }], isError: true };
    if (!sessions?.length) {
      return {
        content: [{ type: "text", text: "No attendance sessions found for that class and date." }],
        structuredContent: { sessions: [], totals: {} },
      };
    }

    const { data: records, error } = await supabase
      .from("attendance_records")
      .select("id, session_id, status, student_id, students(full_name, admission_no)")
      .in(
        "session_id",
        sessions.map((s) => s.id),
      );
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const totals: Record<string, number> = {};
    for (const row of records ?? []) totals[row.status] = (totals[row.status] ?? 0) + 1;

    const payload = { date, class_id, sessions, totals, records: records ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
