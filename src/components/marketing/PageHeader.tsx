export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-brand-sand border-b border-brand-navy/5">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <span className="inline-block py-1 px-3 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-6">
          {eyebrow}
        </span>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] text-brand-navy max-w-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-brand-navy/70 mt-6 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
