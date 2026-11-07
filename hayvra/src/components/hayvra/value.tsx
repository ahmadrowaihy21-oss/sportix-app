const PILLARS = [
  {
    n: "01",
    title: "Guest satisfaction",
    en: "Guest Satisfaction",
    lines: [
      "A preference is saved with consent, not assumed.",
      "A clearer request reaches the right department.",
      "Less time between the question and the response when departments share one path.",
    ],
  },
  {
    n: "02",
    title: "Operational efficiency",
    en: "Operational Efficiency",
    lines: [
      "One path for requests across reception, housekeeping, maintenance, and food and beverage.",
      "The team sees the task status instead of scattered messages.",
      "A maintenance recommendation stays a human decision.",
    ],
  },
  {
    n: "03",
    title: "Revenue growth",
    en: "Revenue Growth",
    lines: [
      "A direct-booking path alongside the hotel’s current channels.",
      "An extra service is offered only if the guest allows it and operations can deliver it.",
      "Measurement is shown as an opportunity, not as a claimed result.",
    ],
  },
  {
    n: "04",
    title: "Energy optimization",
    en: "Energy Optimization",
    lines: [
      "A ready mode as the guest approaches, if devices are linked.",
      "A saving mode after the room is confirmed empty.",
      "Location does not switch off the climate while another guest is still inside.",
    ],
  },
];

export function Value() {
  return (
    <section id="value" className="scroll-mt-24 border-t border-gold/20 py-20 md:py-28" aria-labelledby="value-title">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <p className="num">04</p>
        <p className="kicker mt-5" lang="en" dir="ltr">
          Business Value
        </p>
        <h2 id="value-title" className="mt-3 max-w-3xl text-3xl font-light md:text-5xl">
          Value for owners and investors
        </h2>
        <p className="quiet mt-5 max-w-3xl">
          Four mechanisms. No invented savings rates, and no revenue attributed to real hotels.
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map((item) => (
            <article key={item.n} className="border-t border-gold/40 pt-6">
              <p className="num">{item.n}</p>
              <h3 className="mt-4 text-2xl font-light">{item.title}</h3>
              <p className="kicker mt-2" lang="en" dir="ltr">
                {item.en}
              </p>
              <ul className="mt-4 space-y-3">
                {item.lines.map((line) => (
                  <li key={line} className="quiet text-sm leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
