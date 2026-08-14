import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "mark_attendance",
  title: "Mark attendance",
  description:
    "Mark or update a student's attendance status for a class session (creating the session if needed). Changes are recorded in the audit log.",
  inputSchema: {
    class_id: z.string().uuid().describe("Class the session belongs to."),
    student_id: z.string().uuid().describe("Student to mark."),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Session date in YYYY-MM-DD format."),
    period: z.string().trim().min(1).default("Full Day").describe("Period label, e.g. 'Full Day'."),
    status: z.enum(["present", "absent", "late", "excused"]).describe("Attendance status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ class_id, student_id, date, period, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    const { data: existing, error: findError } = await supabase
      .from("attendance_sessions")
      .select("id")
      .eq("class_id", class_id)
      .eq("session_date", date)
      .eq("period", period)
      .maybeSingle();
    if (findError) return { content: [{ type: "text", text: findError.message }], isError: true };

    let sessionId = existing?.id;
    if (!sessionId) {
      const { data: created, error: createError } = await supabase
        .from("attendance_sessions")
        .insert({ class_id, session_date: date, period, taken_by: ctx.getUserId() })
        .select("id")
        .single();
      if (createError) return { content: [{ type: "text", text: createError.message }], isError: true };
      sessionId = created.id;
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .upsert(
        { session_id: sessionId, student_id, status, marked_by: ctx.getUserId() },
        { onConflict: "session_id,student_id" },
      )
      .select("id, session_id, student_id, status")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { record: data },
    };
  },
});
