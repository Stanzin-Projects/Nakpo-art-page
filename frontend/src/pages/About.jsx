export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-3xl text-ink mb-6">About</h1>
      <div className="prose prose-stone max-w-none">
        <p className="text-ink/90 leading-relaxed mb-4">
          Lopsang Rinchen is an artist whose work explores the intersection of traditional
          forms and contemporary expression. Each piece is a dialogue between heritage and
          the present moment.
        </p>
        <p className="text-ink/90 leading-relaxed">
          For inquiries, commissions, or collaboration, please use the{' '}
          <a href="/contact" className="text-gold hover:underline">contact</a> page.
        </p>
      </div>
    </div>
  );
}
