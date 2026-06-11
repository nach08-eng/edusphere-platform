import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHeader } from "@/components/marketing/PageHeader";

export const Route = createFileRoute("/academics")({
  head: () => ({
    meta: [
      { title: "Academics — Curriculum & Departments | KMSS School" },
      { name: "description", content: "Explore KMSS School's curriculum from Kindergarten through Higher Secondary, our academic departments, and the subjects we teach." },
      { property: "og:title", content: "Academics at KMSS School" },
      { property: "og:description", content: "Curriculum, departments, and subjects from KG through Higher Secondary." },
    ],
  }),
  component: AcademicsPage,
});

const departments = [
  { name: "Languages", subjects: ["Tamil", "English", "Hindi"] },
  { name: "Mathematics", subjects: ["Arithmetic", "Algebra", "Geometry", "Calculus"] },
  { name: "Sciences", subjects: ["Physics", "Chemistry", "Biology", "EVS"] },
  { name: "Social Studies", subjects: ["History", "Geography", "Civics", "Economics"] },
  { name: "Computer Science", subjects: ["Computing", "Coding", "Digital Literacy"] },
  { name: "Arts & Sports", subjects: ["Music", "Visual Arts", "Athletics", "Yoga"] },
];

const stages = [
  { name: "Kindergarten", grades: "LKG – UKG", focus: "Play-based learning, motor skills, foundational literacy" },
  { name: "Primary", grades: "Grades 1 – 5", focus: "Reading fluency, numeracy, inquiry-based projects" },
  { name: "Middle School", grades: "Grades 6 – 8", focus: "Subject specialization, critical thinking, lab work" },
  { name: "Secondary", grades: "Grades 9 – 10", focus: "Board exam preparation, structured exam practice" },
  { name: "Higher Secondary", grades: "Grades 11 – 12", focus: "Streams in Science, Commerce, Arts; entrance prep" },
];

function AcademicsPage() {
  return (
    <MarketingLayout>
      <PageHeader
        eyebrow="Academics"
        title="A curriculum that grows with every student."
        description="From kindergarten to higher secondary — a thoughtful progression in academic rigor, character, and curiosity."
      />

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-brand-navy mb-12">Stages of Learning</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((s) => (
            <div key={s.name} className="border border-brand-navy/10 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{s.grades}</span>
              <h3 className="font-serif text-xl font-bold text-brand-navy mt-3 mb-3">{s.name}</h3>
              <p className="text-sm text-brand-navy/60 leading-relaxed">{s.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-sand py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-brand-navy mb-12">Departments & Subjects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d) => (
              <div key={d.name} className="bg-white rounded-xl p-6 border border-brand-navy/5">
                <h3 className="font-bold text-brand-navy mb-4">{d.name}</h3>
                <ul className="space-y-2">
                  {d.subjects.map((sub) => (
                    <li key={sub} className="text-sm text-brand-navy/70 flex items-center gap-2">
                      <div className="size-1 rounded-full bg-brand-gold" />
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
