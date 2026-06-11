import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-brand-navy/5 py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="size-8 bg-brand-navy rounded flex items-center justify-center text-white font-serif text-lg">
              K
            </div>
            <span className="font-serif font-bold text-lg text-brand-navy">KMSS</span>
          </div>
          <p className="text-sm text-brand-navy/60 leading-relaxed">
            Main Road, Thiruppathur,
            <br />
            Tamil Nadu, 630211
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-brand-navy">Academics</h4>
          <ul className="space-y-4 text-sm text-brand-navy/60">
            <li><Link to="/academics" className="hover:text-brand-gold">Curriculum</Link></li>
            <li><Link to="/academics" className="hover:text-brand-gold">School Calendar</Link></li>
            <li><Link to="/academics" className="hover:text-brand-gold">Extracurricular</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-brand-navy">Community</h4>
          <ul className="space-y-4 text-sm text-brand-navy/60">
            <li><Link to="/auth" className="hover:text-brand-gold">Parent Portal</Link></li>
            <li><Link to="/about" className="hover:text-brand-gold">Alumni Network</Link></li>
            <li><Link to="/admissions" className="hover:text-brand-gold">Admissions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-brand-navy">Connect</h4>
          <p className="text-sm text-brand-navy/60 mb-4">admin@kmss-school.edu</p>
          <p className="text-sm text-brand-navy/60">+91 4575 234567</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-black/5 flex justify-between items-center text-[10px] uppercase tracking-widest text-brand-navy/40 font-bold">
        <span>&copy; 2024 KMSS Thiruppathur</span>
        <span>KMSS Edura Suite</span>
      </div>
    </footer>
  );
}
