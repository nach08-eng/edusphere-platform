import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHeader } from "@/components/marketing/PageHeader";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact KMSS School Thiruppathur" },
      { name: "description", content: "Get in touch with KMSS School in Thiruppathur, Tamil Nadu — address, phone, email, and contact form." },
      { property: "og:title", content: "Contact KMSS School" },
      { property: "og:description", content: "Address, phone, email, and contact form." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <MarketingLayout>
      <PageHeader
        eyebrow="Contact"
        title="We'd love to hear from you."
        description="Visit, call, write, or use the form below. Our admissions team responds within 2 business days."
      />

      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16">
        <div className="space-y-8">
          {[
            { icon: MapPin, label: "Address", value: "Main Road, Thiruppathur, Tamil Nadu — 630211" },
            { icon: Phone, label: "Phone", value: "+91 4575 234567" },
            { icon: Mail, label: "Email", value: "admin@kmss-school.edu" },
            { icon: Clock, label: "Office Hours", value: "Mon – Sat, 8:30 AM – 4:30 PM" },
          ].map((c) => (
            <div key={c.label} className="flex gap-4 items-start">
              <div className="size-11 bg-brand-navy text-brand-gold rounded-md flex items-center justify-center shrink-0">
                <c.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-navy/50">{c.label}</p>
                <p className="text-brand-navy mt-1">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="bg-brand-sand p-8 rounded-xl space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you! We'll reply soon.");
          }}
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Name</label>
            <input required type="text" className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 bg-white focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Email</label>
            <input required type="email" className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 bg-white focus:outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 block">Message</label>
            <textarea rows={5} className="w-full border border-brand-navy/15 rounded-sm px-4 py-3 bg-white focus:outline-none focus:border-brand-gold" />
          </div>
          <button type="submit" className="bg-brand-navy text-white px-8 py-3 rounded-sm font-semibold hover:bg-brand-navy/90 transition-all">
            Send message
          </button>
        </form>
      </section>
    </MarketingLayout>
  );
}
