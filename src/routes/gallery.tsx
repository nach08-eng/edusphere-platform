import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { PageHeader } from "@/components/marketing/PageHeader";
import primaryImg from "@/assets/program-primary.jpg";
import middleImg from "@/assets/program-middle.jpg";
import secondaryImg from "@/assets/program-secondary.jpg";
import heroImg from "@/assets/hero-students.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Campus Life at KMSS School" },
      { name: "description", content: "Photos from across KMSS School Thiruppathur — classrooms, labs, events, sports, and everyday campus life." },
      { property: "og:title", content: "Gallery — KMSS School" },
      { property: "og:description", content: "Photos from across KMSS School Thiruppathur." },
    ],
  }),
  component: GalleryPage,
});

const photos = [
  { src: heroImg, caption: "Library hallway" },
  { src: primaryImg, caption: "Primary classroom" },
  { src: middleImg, caption: "Science lab" },
  { src: secondaryImg, caption: "Computer lab" },
  { src: heroImg, caption: "Morning assembly" },
  { src: primaryImg, caption: "Art class" },
  { src: middleImg, caption: "Group projects" },
  { src: secondaryImg, caption: "Senior school" },
];

function GalleryPage() {
  return (
    <MarketingLayout>
      <PageHeader
        eyebrow="Gallery"
        title="A glimpse of campus life."
        description="Moments from classrooms, labs, sports fields, and assemblies — the rhythm of KMSS."
      />
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {photos.map((p, i) => (
            <figure key={i} className="group cursor-pointer">
              <div className="overflow-hidden rounded-lg aspect-square">
                <img
                  src={p.src}
                  alt={p.caption}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <figcaption className="text-xs text-brand-navy/60 mt-2 uppercase tracking-wider">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
