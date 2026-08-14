import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_students",
  title: "List students",
  description:
    "Search the student directory. Optionally filter by name/admission number, class id, or enrolment status.",
  inputSchema: {
    search: z.string().trim().optional().describe("Match against student name or admission number."),
    class_id: z.string().uuid().optional().describe("Only students in this class."),
    status: z.enum(["active", "inactive", "suspended"]).optional().describe("Enrolment status filter."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, class_id, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("students")
      .select("id, admission_no, full_name, roll_no, status, class_id, guardian_name, guardian_phone")
      .order("full_name")
      .limit(limit ?? 25);
    if (class_id) query = query.eq("class_id", class_id);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`full_name.ilike.%${search}%,admission_no.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { students: data ?? [] },
    };
  },
});
