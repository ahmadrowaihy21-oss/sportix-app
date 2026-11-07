const PEOPLE = [
  {
    mark: "M",
    name: "Muaz Bader Bahkali",
    en: "Muaz Bader Bahkali",
    role: "Founder",
    line: "Founder & Leader of Intelligent Hospitality and Tourism Solutions",
    photo: "/media/muaz.jpg",
  },
  {
    mark: "A",
    name: "Ahmad Rowaihy",
    en: "Ahmad Rowaihy",
    role: "Co-founder",
    line: "Product Architect · App Ecosystem Builder · AI Systems Designer",
    photo: "/media/ahmad.jpg",
  },
];

export function Team() {
  return (
    <section id="team" className="scroll-mt-24 border-t border-gold/20 py-20 md:py-32" aria-labelledby="team-title">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <p className="num">06</p>
        <p className="kicker mt-5" lang="en" dir="ltr">
          Founding Team
        </p>
        <h2 id="team-title" className="mt-3 text-3xl font-light md:text-5xl">
          The founders
        </h2>
        <div className="mt-16 grid gap-16 md:grid-cols-2">
          {PEOPLE.map((person) => (
            <article key={person.en} className="border-t border-gold/30 pt-8">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  width={1280}
                  height={720}
                  decoding="async"
                  className="team-photo"
                />
              ) : (
                <div className="mono" aria-hidden="true">
                  {person.mark}
                </div>
              )}
              <h3 className="mt-8 text-3xl font-light" lang={person.photo ? "en" : undefined} dir={person.photo ? "ltr" : undefined}>
                {person.name}
              </h3>
              {person.line ? (
                <p className="kicker mt-3" lang="en" dir="ltr">
                  {person.line}
                </p>
              ) : (
                <p className="kicker mt-3" lang="en" dir="ltr">
                  {person.en}
                </p>
              )}
              <p className="mt-4 text-lg" lang={person.photo ? "en" : undefined} dir={person.photo ? "ltr" : undefined}>
                {person.role}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
