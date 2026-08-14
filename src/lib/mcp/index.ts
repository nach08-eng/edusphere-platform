import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listClassesTool from "./tools/list-classes";
import listStudentsTool from "./tools/list-students";
import getStudentTool from "./tools/get-student";
import attendanceSummaryTool from "./tools/attendance-summary";
import markAttendanceTool from "./tools/mark-attendance";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "edusphere-platform",
  title: "EduSphere Platform",
  version: "0.1.0",
  instructions:
    "Tools for the KMSS School ERP. Use `list_classes` and `list_students` to explore the directory, `get_student` for a full record, `attendance_summary` to review a class day, and `mark_attendance` to record a status. All calls act as the signed-in school user and respect their permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listClassesTool, listStudentsTool, getStudentTool, attendanceSummaryTool, markAttendanceTool],
});
