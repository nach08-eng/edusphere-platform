import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ClassRow = Tables<"classes">;
export type StudentRow = Tables<"students">;
export type StudentWithClass = StudentRow & { classes: Pick<ClassRow, "id" | "name" | "section"> | null };

export const STATUSES = ["active", "alumni", "transferred", "suspended"] as const;
export const GENDERS = ["male", "female", "other"] as const;

export const studentSchema = z.object({
  admission_no: z.string().trim().min(1, "Admission number is required").max(40),
  full_name: z.string().trim().min(2, "Name is required").max(120),
  date_of_birth: z.string().trim().max(10).optional().or(z.literal("")),
  gender: z.enum(GENDERS).optional().or(z.literal("")),
  blood_group: z.string().trim().max(6).optional().or(z.literal("")),
  class_id: z.string().uuid().optional().or(z.literal("")),
  roll_no: z.string().trim().max(6).optional().or(z.literal("")),
  guardian_name: z.string().trim().max(120).optional().or(z.literal("")),
  guardian_phone: z.string().trim().max(24).optional().or(z.literal("")),
  guardian_email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(400).optional().or(z.literal("")),
  admission_date: z.string().trim().max(10).optional().or(z.literal("")),
  status: z.enum(STATUSES),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export function toPayload(v: StudentFormValues) {
  const nn = (s?: string) => (s && s.length ? s : null);
  return {
    admission_no: v.admission_no.trim(),
    full_name: v.full_name.trim(),
    date_of_birth: nn(v.date_of_birth),
    gender: (nn(v.gender) as StudentRow["gender"]) ?? null,
    blood_group: nn(v.blood_group),
    class_id: nn(v.class_id),
    roll_no: v.roll_no && v.roll_no.length ? Number(v.roll_no) : null,
    guardian_name: nn(v.guardian_name),
    guardian_phone: nn(v.guardian_phone),
    guardian_email: nn(v.guardian_email),
    address: nn(v.address),
    admission_date: nn(v.admission_date) ?? new Date().toISOString().slice(0, 10),
    status: v.status,
  };
}

export function emptyStudent(): StudentFormValues {
  return {
    admission_no: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    class_id: "",
    roll_no: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    address: "",
    admission_date: new Date().toISOString().slice(0, 10),
    status: "active",
  };
}

export function toFormValues(s: StudentRow): StudentFormValues {
  return {
    admission_no: s.admission_no,
    full_name: s.full_name,
    date_of_birth: s.date_of_birth ?? "",
    gender: (s.gender ?? "") as StudentFormValues["gender"],
    blood_group: s.blood_group ?? "",
    class_id: s.class_id ?? "",
    roll_no: s.roll_no != null ? String(s.roll_no) : "",
    guardian_name: s.guardian_name ?? "",
    guardian_phone: s.guardian_phone ?? "",
    guardian_email: s.guardian_email ?? "",
    address: s.address ?? "",
    admission_date: s.admission_date ?? "",
    status: s.status,
  };
}

export const classLabel = (c?: { name: string; section: string } | null) =>
  c ? `${c.name} — ${c.section}` : "Unassigned";

/* ---------- queries ---------- */

export const studentsQuery = () => ({
  queryKey: ["students"],
  queryFn: async (): Promise<StudentWithClass[]> => {
    const { data, error } = await supabase
      .from("students")
      .select("*, classes(id, name, section)")
      .order("admission_no", { ascending: true });
    if (error) throw error;
    return (data ?? []) as StudentWithClass[];
  },
});

export const studentQuery = (id: string) => ({
  queryKey: ["students", id],
  queryFn: async (): Promise<StudentWithClass | null> => {
    const { data, error } = await supabase
      .from("students")
      .select("*, classes(id, name, section)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as StudentWithClass | null;
  },
});

export const classesQuery = () => ({
  queryKey: ["classes"],
  queryFn: async (): Promise<ClassRow[]> => {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("name", { ascending: true })
      .order("section", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const myRolesQuery = (userId: string) => ({
  queryKey: ["my-roles", userId],
  queryFn: async (): Promise<string[]> => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((r) => r.role as string);
  },
});
