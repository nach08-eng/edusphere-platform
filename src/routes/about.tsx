import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHeader } from "@/components/marketing/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About KMSS School — Our Mission, Vision & History" },
      { name: "description", content: "Learn about KMSS School Thiruppathur — our mission, vision, history since 1998, leadership, and the educators shaping the next generation." },
      { property: "og:title", content: "About KMSS School Thiruppathur" },
      { property: "og:description", content: "Our mission, vision, and 25-year legacy of education in Thiruppathur." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MarketingLayout>
      <PageHeader
        eyebrow="About Us"
        title="A 25-year legacy of education in Thiruppathur."
        description="Since 1998, KMSS School has been committed to nurturing well-rounded students who excel academically and grow into responsible citizens."
      />

      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-3 block">Our Mission</span>
          <h2 className="font-serif text-3xl text-brand-navy mb-6">Education with purpose</h2>
          <p className="text-brand-navy/70 leading-relaxed">
            To provide every student with an environment where academic excellence, ethical values, and personal growth converge — preparing them to thrive in a rapidly changing world while staying rooted in their heritage.
          </p>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold mb-3 block">Our Vision</span>
          <h2 className="font-serif text-3xl text-brand-navy mb-6">A community that learns together</h2>
          <p className="text-brand-navy/70 leading-relaxed">
            To be Tamil Nadu's most trusted K-12 institution — where families, teachers, and students build a lifelong partnership powered by curiosity, character, and modern pedagogy.
          </p>
        </div>
      </section>

      <section className="bg-brand-sand py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-brand-navy mb-12 max-w-xl">Principal's Message</h2>
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <div className="aspect-[4/5] bg-brand-navy/10 rounded-2xl flex items-center justify-center text-brand-navy/30 text-sm uppercase tracking-widest">
                Principal Portrait
              </div>
            </div>
            <div className="md:col-span-7 flex flex-col justify-center">
              <blockquote className="font-serif text-2xl md:text-3xl italic text-brand-navy leading-tight mb-8">
                "Education at KMSS is not just about academic rigor; it is about grounding our students in values that reflect our rich heritage while preparing them for a global future."
              </blockquote>
              <p className="text-brand-navy/70 leading-relaxed mb-6 max-w-prose">
                Since our founding, we have remained committed to the holistic development of every child who walks through our gates. Our teachers serve as mentors, fostering a culture of curiosity and mutual respect.
              </p>
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-brand-navy/30" />
                <span className="font-medium text-brand-navy">Dr. A. Meenakshi, Principal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-brand-navy mb-12">Our Journey</h2>
        <div className="space-y-8">
          {[
            { year: "1998", title: "Founded", text: "KMSS opens its doors in Thiruppathur with 80 students across 4 grades." },
            { year: "2005", title: "Secondary wing", text: "Higher secondary classes added; first batch passes board exams with distinction." },
            { year: "2014", title: "Smart classrooms", text: "Digital learning rolled out across all grade levels." },
            { year: "2024", title: "Unified portal", text: "Launch of the integrated ERP & LMS connecting parents, teachers and students." },
          ].map((m) => (
            <div key={m.year} className="grid md:grid-cols-12 gap-6 pb-8 border-b border-brand-navy/5 last:border-0">
              <div className="md:col-span-2 font-serif text-3xl text-brand-gold font-bold">{m.year}</div>
              <div className="md:col-span-10">
                <h3 className="font-bold text-brand-navy mb-2">{m.title}</h3>
                <p className="text-brand-navy/70 leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
