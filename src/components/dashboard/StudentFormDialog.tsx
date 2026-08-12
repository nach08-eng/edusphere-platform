import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  studentSchema,
  toPayload,
  emptyStudent,
  toFormValues,
  GENDERS,
  STATUSES,
  classLabel,
  type ClassRow,
  type StudentRow,
  type StudentFormValues,
} from "@/lib/students";

const field =
  "w-full border border-brand-navy/15 rounded-sm px-3 py-2 bg-white text-sm text-brand-navy focus:outline-none focus:border-brand-gold";
const lbl = "text-[10px] font-bold uppercase tracking-widest text-brand-navy/50 mb-1.5 block";

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  classes,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: StudentRow | null;
  classes: ClassRow[];
}) {
  const qc = useQueryClient();
  const [values, setValues] = useState<StudentFormValues>(emptyStudent());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(student ? toFormValues(student) : emptyStudent());
      setErrors({});
    }
  }, [open, student]);

  const set = (k: keyof StudentFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value } as StudentFormValues));

  const save = useMutation({
    mutationFn: async (v: StudentFormValues) => {
      const payload = toPayload(v);
      if (student) {
        const { error } = await supabase.from("students").update(payload).eq("id", student.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("students").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success(student ? "Student updated" : "Student admitted");
      onOpenChange(false);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save student"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = studentSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    save.mutate(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-brand-sand">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-brand-navy">
            {student ? "Edit student" : "New admission"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Admission no.</label>
            <input className={field} value={values.admission_no} onChange={set("admission_no")} />
            {errors["admission_no"] && <p className="text-xs text-red-600 mt-1">{errors["admission_no"]}</p>}
          </div>
          <div>
            <label className={lbl}>Full name</label>
            <input className={field} value={values.full_name} onChange={set("full_name")} />
            {errors["full_name"] && <p className="text-xs text-red-600 mt-1">{errors["full_name"]}</p>}
          </div>
          <div>
            <label className={lbl}>Date of birth</label>
            <input type="date" className={field} value={values.date_of_birth ?? ""} onChange={set("date_of_birth")} />
          </div>
          <div>
            <label className={lbl}>Gender</label>
            <select className={field} value={values.gender ?? ""} onChange={set("gender")}>
              <option value="">Not specified</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Class</label>
            <select className={field} value={values.class_id ?? ""} onChange={set("class_id")}>
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {classLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Roll no.</label>
              <input className={field} value={values.roll_no ?? ""} onChange={set("roll_no")} />
            </div>
            <div>
              <label className={lbl}>Blood group</label>
              <input className={field} value={values.blood_group ?? ""} onChange={set("blood_group")} />
            </div>
          </div>
          <div>
            <label className={lbl}>Guardian name</label>
            <input className={field} value={values.guardian_name ?? ""} onChange={set("guardian_name")} />
          </div>
          <div>
            <label className={lbl}>Guardian phone</label>
            <input className={field} value={values.guardian_phone ?? ""} onChange={set("guardian_phone")} />
          </div>
          <div>
            <label className={lbl}>Guardian email</label>
            <input className={field} value={values.guardian_email ?? ""} onChange={set("guardian_email")} />
            {errors["guardian_email"] && <p className="text-xs text-red-600 mt-1">{errors["guardian_email"]}</p>}
          </div>
          <div>
            <label className={lbl}>Admission date</label>
            <input type="date" className={field} value={values.admission_date ?? ""} onChange={set("admission_date")} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Address</label>
            <textarea rows={2} className={field} value={values.address ?? ""} onChange={set("address")} />
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select className={field} value={values.status} onChange={set("status")}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="sm:col-span-2 mt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-sm border border-brand-navy/15 text-sm font-medium text-brand-navy hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="px-5 py-2.5 rounded-sm bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : student ? "Save changes" : "Admit student"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
