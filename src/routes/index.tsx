import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, GraduationCap, Users2, BookOpen, Award, ShieldCheck, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-students.jpg";
import primaryImg from "@/assets/program-primary.jpg";
import middleImg from "@/assets/program-middle.jpg";
import secondaryImg from "@/assets/program-secondary.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KMSS School Thiruppathur — Nurturing Minds, Defining Futures" },
      { name: "description", content: "KMSS School in Thiruppathur, Tamil Nadu — excellence in K-12 education since 1998. Modern curriculum, dedicated faculty, integrated parent and student portal." },
      { property: "og:title", content: "KMSS School Thiruppathur" },
      { property: "og:description", content: "Excellence in K-12 education in Thiruppathur, Tamil Nadu. Modern curriculum and integrated school portal." },
      { property: "og:image", content: heroImg },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const stats = [
  { value: "1,248", label: "Active Students" },
  { value: "85+", label: "Expert Faculty" },
  { value: "100%", label: "Board Pass Rate" },
  { value: "25", label: "Years of Legacy" },
];

const programs = [
  { img: primaryImg, title: "Primary School", desc: "Foundation years focusing on literacy, numeracy, and creative exploration for ages 5–11.", tag: "Primary" },
  { img: middleImg, title: "Middle School", desc: "Developing critical thinking and subject specialization for students in grades 6 through 8.", tag: "Middle" },
  { img: secondaryImg, title: "Secondary School", desc: "Rigorous academic preparation for board examinations and higher university education.", tag: "Secondary" },
];

const features = [
  { icon: GraduationCap, title: "Academic Excellence", text: "A balanced curriculum aligned with state and CBSE standards." },
  { icon: Users2, title: "Dedicated Faculty", text: "85+ qualified teachers committed to every student's growth." },
  { icon: BookOpen, title: "Modern Library", text: "20,000+ books and digital resources for self-directed learning." },
  { icon: Award, title: "Co-Curriculars", text: "Sports, arts, music, and clubs that build character and confidence." },
  { icon: ShieldCheck, title: "Safe Campus", text: "Secure, monitored campus with trained staff and CCTV coverage." },
  { icon: Sparkles, title: "Smart Classrooms", text: "Digital boards and interactive learning across all grade levels." },
];

function HomePage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-sand pt-16 md:pt-20 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="animate-fade-up">
            <span className="inline-block py-1 px-3 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-6">
              Established 1998 • Thiruppathur
            </span>
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.1] text-brand-navy mb-8">
              Nurturing Minds,
              <br />
              <span className="italic">Defining Futures.</span>
            </h1>
            <p className="text-lg text-brand-navy/70 mb-10 max-w-lg leading-relaxed">
              Excellence in education through a balanced curriculum of academic rigor and character development at the heart of Thiruppathur.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admissions"
                className="bg-brand-gold text-white px-8 py-4 rounded-sm font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                Admissions 2024-25 <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="border border-brand-navy/20 px-8 py-4 rounded-sm font-semibold hover:bg-brand-navy hover:text-white transition-all"
              >
                Explore Campus
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="KMSS School students in the library hallway"
              width={1280}
              height={1600}
              className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-brand-navy/5 max-w-[200px]">
              <p className="text-3xl font-bold text-brand-gold mb-1">100%</p>
              <p className="text-xs font-medium text-brand-navy/60 uppercase tracking-wider">Board Exam Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-brand-navy/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`py-10 text-center ${i > 0 ? "md:border-l border-brand-navy/5" : ""}`}>
              <p className="font-serif text-3xl md:text-4xl font-bold text-brand-navy">{s.value}</p>
              <p className="text-xs uppercase tracking-widest text-brand-navy/50 mt-2 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl md:text-4xl mb-4 text-brand-navy">Academic Excellence</h2>
            <p className="text-brand-navy/60">
              Providing a comprehensive learning environment that prepares students for global challenges.
            </p>
          </div>
          <Link
            to="/academics"
            className="text-brand-gold font-semibold flex items-center gap-2 group italic"
          >
            View all programs
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((p) => (
            <div key={p.title} className="group cursor-pointer">
              <div className="overflow-hidden rounded-lg mb-6">
                <img
                  src={p.img}
                  alt={p.title}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-brand-navy">{p.title}</h3>
              <p className="text-brand-navy/60 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-brand-sand py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-navy max-w-2xl mb-12">
            Why families choose KMSS
          </h2>
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {features.map((f) => (
              <div key={f.title}>
                <div className="size-11 bg-brand-navy text-brand-gold rounded-md flex items-center justify-center mb-4">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-bold text-brand-navy mb-2">{f.title}</h3>
                <p className="text-sm text-brand-navy/60 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal teaser */}
      <section className="bg-brand-navy py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-4">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">The KMSS Management Suite</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              A unified ERP and LMS platform for administrators, teachers, parents, and students. Real-time tracking, seamless communication, and academic monitoring.
            </p>
            <ul className="space-y-4 mb-8">
              {["Role-based secure access", "Integrated fee & attendance tracking", "Digital learning resources"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/80">
                  <div className="size-1.5 rounded-full bg-brand-gold" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-brand-gold text-white px-6 py-3 rounded-sm text-sm font-semibold"
            >
              Sign in to portal <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex h-[500px] border border-white/10">
              <div className="w-56 bg-brand-sand border-r border-black/5 p-4 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 bg-brand-navy rounded-sm flex items-center justify-center text-[10px] text-white">KM</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Admin Portal</span>
                </div>
                <div className="space-y-1">
                  {["Dashboard", "Students", "Teachers", "Academics", "Finance", "Reports"].map((label, i) => (
                    <div
                      key={label}
                      className={
                        i === 0
                          ? "px-3 py-2 bg-brand-navy text-white rounded-md text-xs font-medium"
                          : "px-3 py-2 text-brand-navy/40 rounded-md text-xs font-medium"
                      }
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-8 bg-white overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-lg font-bold text-brand-navy">Academic Overview</h4>
                  <div className="size-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-[10px] font-bold text-brand-gold italic">AD</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Total Students", value: "1,248", color: "text-brand-navy" },
                    { label: "Attendance", value: "94.2%", color: "text-emerald-600" },
                    { label: "Fee Collection", value: "82%", color: "text-brand-gold" },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl border border-black/5 bg-brand-sand/30">
                      <p className="text-[10px] uppercase tracking-wider text-brand-navy/40 mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border border-black/5 rounded-xl">
                  <p className="text-xs font-bold mb-4 text-brand-navy">Recent School Activities</p>
                  <div className="space-y-3">
                    {[
                      { dot: "bg-brand-gold", text: "Annual Sports Meet Scheduling", time: "2h ago" },
                      { dot: "bg-brand-navy/20", text: "Teacher Recruitment - Secondary", time: "5h ago" },
                      { dot: "bg-brand-navy/20", text: "Science Lab Inventory Update", time: "Yesterday" },
                    ].map((a) => (
                      <div key={a.text} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                        <div className="flex gap-3 items-center">
                          <div className={`size-2 rounded-full ${a.dot}`} />
                          <span className="text-xs text-brand-navy">{a.text}</span>
                        </div>
                        <span className="text-[10px] text-brand-navy/40">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
