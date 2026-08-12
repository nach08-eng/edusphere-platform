import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Users2, UserCheck, GraduationCap, Pencil, Trash2, Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentFormDialog } from "@/components/dashboard/StudentFormDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  studentsQuery,
  classesQuery,
  myRolesQuery,
  classLabel,
  STATUSES,
  type StudentWithClass,
} from "@/lib/students";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/dashboard/students/")({
  head: () => ({
    meta: [
      { title: "Students — KMSS School Portal" },
      { name: "description", content: "Student directory, admissions, and records for KMSS School Thiruppathur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentsPage,
});

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  alumni: "bg-brand-navy/5 text-brand-navy/70",
  transferred: "bg-amber-50 text-amber-700",
  suspended: "bg-red-50 text-red-700",
};

function StudentsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StudentWithClass | null>(null);
  const [deleting, setDeleting] = useState<StudentWithClass | null>(null);

  const students = useQuery(studentsQuery());
  const classes = useQuery(classesQuery());
  const roles = useQuery(myRolesQuery(user.id));

  const canManage = (roles.data ?? []).some((r) => r === "super_admin" || r === "principal");

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student record removed");
      setDeleting(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (students.data ?? []).filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (classFilter && s.class_id !== classFilter) return false;
      if (!q) return true;
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.admission_no.toLowerCase().includes(q) ||
        (s.guardian_name ?? "").toLowerCase().includes(q) ||
        (s.guardian_phone ?? "").includes(q)
      );
    });
  }, [students.data, search, classFilter, statusFilter]);

  const all = students.data ?? [];
  const stats = [
    { label: "Total records", value: all.length, icon: Users2 },
    { label: "Active students", value: all.filter((s) => s.status === "active").length, icon: UserCheck },
    { label: "Classes", value: (classes.data ?? []).length, icon: GraduationCap },
  ];

  function exportCsv() {
    const header = ["Admission No", "Name", "Class", "Roll", "Guardian", "Phone", "Status"];
    const lines = rows.map((s) =>
      [s.admission_no, s.full_name, classLabel(s.classes), s.roll_no ?? "", s.guardian_name ?? "", s.guardian_phone ?? "", s.status]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kmss-students.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout user={{ email: user.email, full_name: null }}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">Module</p>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-navy">Student Management</h1>
          <p className="text-brand-navy/60 mt-2">Admissions, profiles, class allocation, and guardian records.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-brand-navy/15 bg-white text-sm font-medium text-brand-navy hover:bg-brand-sand"
          >
            <Download className="size-4" /> Export
          </button>
          {canManage && (
            <button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90"
            >
              <Plus className="size-4" /> New admission
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-navy/5 p-5">
            <div className="size-9 bg-brand-sand rounded-md flex items-center justify-center text-brand-navy/60 mb-3">
              <s.icon className="size-4" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-navy">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-brand-navy/5 overflow-hidden">
        <div className="p-4 border-b border-brand-navy/5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, admission no., or guardian…"
              className="w-full pl-9 pr-3 py-2.5 rounded-sm border border-brand-navy/15 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2.5 rounded-sm border border-brand-navy/15 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
          >
            <option value="">All classes</option>
            {(classes.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {classLabel(c)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-sm border border-brand-navy/15 text-sm text-brand-navy focus:outline-none focus:border-brand-gold"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold border-b border-brand-navy/5">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Admission no.</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Guardian</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-brand-navy/50">
                    Loading students…
                  </td>
                </tr>
              )}
              {students.isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-600">
                    You don't have permission to view student records.
                  </td>
                </tr>
              )}
              {!students.isLoading && !students.isError && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-brand-navy/50">
                    No students match these filters.
                  </td>
                </tr>
              )}
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-brand-navy/5 last:border-0 hover:bg-brand-sand/40">
                  <td className="px-4 py-3">
                    <Link
                      to="/dashboard/students/$studentId"
                      params={{ studentId: s.id }}
                      className="flex items-center gap-3 group"
                    >
                      <span className="size-8 rounded-full bg-brand-sand text-brand-navy text-xs font-bold flex items-center justify-center">
                        {s.full_name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-brand-navy group-hover:text-brand-gold">{s.full_name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">{s.admission_no}</td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {classLabel(s.classes)}
                    {s.roll_no ? <span className="text-brand-navy/40"> · #{s.roll_no}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    <div>{s.guardian_name ?? "—"}</div>
                    <div className="text-xs text-brand-navy/40">{s.guardian_phone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${statusStyles[s.status] ?? ""}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {canManage && (
                        <>
                          <button
                            aria-label={`Edit ${s.full_name}`}
                            onClick={() => {
                              setEditing(s);
                              setDialogOpen(true);
                            }}
                            className="p-2 rounded hover:bg-brand-sand text-brand-navy/60"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            aria-label={`Delete ${s.full_name}`}
                            onClick={() => setDeleting(s)}
                            className="p-2 rounded hover:bg-red-50 text-red-600/70"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editing}
        classes={classes.data ?? []}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove student record?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.full_name} ({deleting?.admission_no}) will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
