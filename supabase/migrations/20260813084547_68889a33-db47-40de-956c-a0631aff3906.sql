CREATE TYPE public.audit_action AS ENUM ('marked', 'changed', 'removed');

CREATE TABLE public.attendance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  action public.audit_action NOT NULL,
  old_status public.attendance_status,
  new_status public.attendance_status,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attendance_audit_session ON public.attendance_audit_log(session_id, changed_at DESC);
CREATE INDEX idx_attendance_audit_student ON public.attendance_audit_log(student_id, changed_at DESC);

GRANT SELECT ON public.attendance_audit_log TO authenticated;
GRANT ALL ON public.attendance_audit_log TO service_role;

ALTER TABLE public.attendance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view attendance audit log"
ON public.attendance_audit_log FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Students view own attendance audit log"
ON public.attendance_audit_log FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = attendance_audit_log.student_id AND s.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.log_attendance_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.attendance_audit_log (record_id, session_id, student_id, action, old_status, new_status, changed_by)
    VALUES (NEW.id, NEW.session_id, NEW.student_id, 'marked', NULL, NEW.status, COALESCE(auth.uid(), NEW.marked_by));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.remarks IS DISTINCT FROM OLD.remarks THEN
      INSERT INTO public.attendance_audit_log (record_id, session_id, student_id, action, old_status, new_status, changed_by)
      VALUES (NEW.id, NEW.session_id, NEW.student_id, 'changed', OLD.status, NEW.status, COALESCE(auth.uid(), NEW.marked_by));
    END IF;
    RETURN NEW;
  ELSE
    INSERT INTO public.attendance_audit_log (record_id, session_id, student_id, action, old_status, new_status, changed_by)
    VALUES (OLD.id, OLD.session_id, OLD.student_id, 'removed', OLD.status, NULL, auth.uid());
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER attendance_records_audit
AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.log_attendance_change();