import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHeader } from "@/components/marketing/PageHeader";
import { FileText, Calendar, Upload, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions 2024-25 — Apply to KMSS School Thiruppathur" },
      { name: "description", content: "Admissions are open for the 2024-25 academic year at KMSS School. Learn about the process, eligibility, fees, and how to apply online." },
      { property: "og:title", content: "Admissions at KMSS School" },
      { property: "og:description", content: "Apply for the 2024-25 academic year. Simple online process." },
    ],
  }),
  component: AdmissionsPage,
});

const steps = [
  { icon: FileText, title: "Submit application", text: "Fill out the online form with student and parent details." },
  { icon: Upload, title: "Upload documents", text: "Birth certificate, previous report card, and address proof." },
  { icon: Calendar, title: "Schedule visit", text: "Visit campus for an interaction and assessment." },
  { icon: CheckCircle2, title: "Receive offer", text: "Confirmation and fee payment to secure admission." },
];

function AdmissionsPage() {
  return (
    <MarketingLayout>
      <PageHeader
        eyebrow="Admissions 2024-25"
        title="Begin your KMSS journey."
        description="A simple, transparent admission process — designed to help us get to know your child and your family."
      />

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-brand-navy mb-12">How to Apply</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="size-12 bg-brand-navy text-brand-gold rounded-md flex items-center justify-center mb-4">
                <s.icon className="size-5" />
              </div>
              <span className="text-xs font-bold text-brand-gold mb-2 block">STEP {i + 1}</span>
              <h3 className="font-bold text-brand-navy mb-2">{s.title}</h3>
              <p className="text-sm text-brand-navy/60 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-sand py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-brand-navy mb-2">Enquiry Form</h2>
          <p className="text-brand-navy/60 mb-10">Tell us about your child. We'll get back within 2 business days.</p>
          <form
            className="space-y-6 bg-white p-8 rounded-xl border border-brand-navy/5"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you! We'll be in touch shortly.");
            }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Parent name</label>
                <input required type="text" className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Phone</label>
                <input required type="tel" className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Email</label>
              <input required type="email" className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Student name</label>
                <input required type="text" className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Grade applying for</label>
                <select required className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-gold bg-white">
                  <option value="">Select…</option>
                  <option>LKG</option><option>UKG</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i}>Grade {i + 1}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Message</label>
              <textarea rows={4} className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 focus:outline-none focus:border-brand-gold" />
            </div>
            <button type="submit" className="bg-brand-gold text-white px-8 py-3 rounded-sm font-semibold hover:shadow-lg transition-all">
              Submit enquiry
            </button>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
