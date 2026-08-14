import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_student",
  title: "Get student",
  description: "Fetch one student's full record by student id or admission number.",
  inputSchema: {
    student_id: z.string().uuid().optional().describe("Student id (uuid)."),
    admission_no: z.string().trim().min(1).optional().describe("Admission number."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ student_id, admission_no }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!student_id && !admission_no) {
      return {
        content: [{ type: "text", text: "Provide student_id or admission_no." }],
        isError: true,
      };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("students")
      .select("*, classes(id, name, section, room, academic_year)")
      .limit(1);
    query = student_id ? query.eq("id", student_id) : query.eq("admission_no", admission_no!);
    const { data, error } = await query.maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Student not found." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { student: data },
    };
  },
});
