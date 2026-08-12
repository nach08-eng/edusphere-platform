CREATE TYPE public.student_status AS ENUM ('active','alumni','transferred','suspended');
CREATE TYPE public.gender AS ENUM ('male','female','other');

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','principal','teacher','accountant'))
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','principal'))
$$;

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL DEFAULT 'A',
  academic_year text NOT NULL DEFAULT '2025-2026',
  class_teacher text,
  room text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, section, academic_year)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view classes" ON public.classes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_no text NOT NULL UNIQUE,
  full_name text NOT NULL,
  date_of_birth date,
  gender public.gender,
  blood_group text,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  roll_no integer,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  address text,
  admission_date date NOT NULL DEFAULT CURRENT_DATE,
  status public.student_status NOT NULL DEFAULT 'active',
  photo_url text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX students_class_idx ON public.students(class_id);
CREATE INDEX students_status_idx ON public.students(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view students" ON public.students FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Students can view own record" ON public.students FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage students" ON public.students FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.classes (name, section, academic_year, class_teacher, room) VALUES
  ('Grade 6','A','2025-2026','Mrs. R. Lakshmi','101'),
  ('Grade 7','A','2025-2026','Mr. S. Karthik','102'),
  ('Grade 8','A','2025-2026','Mrs. P. Devi','201'),
  ('Grade 9','A','2025-2026','Mr. V. Anand','202'),
  ('Grade 10','A','2025-2026','Mrs. T. Meena','301'),
  ('Grade 10','B','2025-2026','Mr. J. Prakash','302');

INSERT INTO public.students (admission_no, full_name, date_of_birth, gender, blood_group, class_id, roll_no, guardian_name, guardian_phone, guardian_email, address, admission_date, status)
SELECT v.admission_no, v.full_name, v.dob::date, v.gender::public.gender, v.bg,
       (SELECT id FROM public.classes c WHERE c.name = v.cls AND c.section = v.sec AND c.academic_year='2025-2026'),
       v.roll, v.gname, v.gphone, v.gemail, v.addr, v.adate::date, v.status::public.student_status
FROM (VALUES
  ('KMSS/2025/001','Aarthi Selvam','2013-04-12','female','O+','Grade 6','A',1,'Selvam M','+91 98400 11223','selvam@example.com','12 North Street, Thiruppathur','2025-06-02','active'),
  ('KMSS/2025/002','Bharath Kumar','2013-07-21','male','B+','Grade 6','A',2,'Kumar R','+91 98400 11224','kumar@example.com','8 Bazaar Road, Thiruppathur','2025-06-02','active'),
  ('KMSS/2025/003','Divya Nandhini','2012-01-09','female','A+','Grade 7','A',1,'Nandhakumar S','+91 98400 11225','nandha@example.com','44 Gandhi Nagar, Thiruppathur','2025-06-02','active'),
  ('KMSS/2025/004','Ezhil Arasan','2012-11-30','male','AB+','Grade 7','A',2,'Arasan P','+91 98400 11226','arasan@example.com','21 Temple Street, Thiruppathur','2025-06-03','active'),
  ('KMSS/2025/005','Fathima Noor','2011-03-17','female','O-','Grade 8','A',1,'Noor Ahmed','+91 98400 11227','noor@example.com','5 Mosque Road, Thiruppathur','2025-06-03','active'),
  ('KMSS/2025/006','Gokul Raj','2011-08-25','male','B-','Grade 8','A',2,'Raj Kumar','+91 98400 11228','rajk@example.com','67 Anna Salai, Thiruppathur','2025-06-04','active'),
  ('KMSS/2025/007','Harini Priya','2010-05-14','female','A-','Grade 9','A',1,'Priyan V','+91 98400 11229','priyan@example.com','19 Lake View, Thiruppathur','2025-06-04','active'),
  ('KMSS/2025/008','Ilango Murugan','2010-09-02','male','O+','Grade 9','A',2,'Murugan K','+91 98400 11230','murugan@example.com','3 Market Street, Thiruppathur','2025-06-05','active'),
  ('KMSS/2025/009','Janani Sri','2009-12-19','female','B+','Grade 10','A',1,'Srinivasan G','+91 98400 11231','srini@example.com','88 College Road, Thiruppathur','2025-06-05','active'),
  ('KMSS/2025/010','Karthikeyan B','2009-02-28','male','A+','Grade 10','A',2,'Balan N','+91 98400 11232','balan@example.com','14 East Street, Thiruppathur','2025-06-06','active'),
  ('KMSS/2025/011','Lakshmi Devi','2009-06-06','female','AB-','Grade 10','B',1,'Devendran R','+91 98400 11233','deven@example.com','7 Park Avenue, Thiruppathur','2025-06-06','active'),
  ('KMSS/2024/044','Mohan Das','2008-10-11','male','O+','Grade 10','B',2,'Dasarathan M','+91 98400 11234','dasa@example.com','30 South Street, Thiruppathur','2024-06-10','alumni')
) AS v(admission_no, full_name, dob, gender, bg, cls, sec, roll, gname, gphone, gemail, addr, adate, status);