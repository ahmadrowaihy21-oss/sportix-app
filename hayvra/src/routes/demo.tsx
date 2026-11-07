import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/hayvra/chrome";
import { saveDemoRequest } from "@/lib/hayvra/demo-store";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Request a demo — HAYVRA" },
      {
        name: "description",
        content: "Request a HAYVRA demo. The form sends your details to the team.",
      },
    ],
  }),
  component: DemoPage,
});

const CODES = [
  { v: "+966", l: "Saudi Arabia +966" },
  { v: "+971", l: "United Arab Emirates +971" },
  { v: "+965", l: "Kuwait +965" },
  { v: "+973", l: "Bahrain +973" },
  { v: "+968", l: "Oman +968" },
  { v: "+974", l: "Qatar +974" },
  { v: "+20", l: "Egypt +20" },
  { v: "+962", l: "Jordan +962" },
  { v: "+44", l: "United Kingdom +44" },
  { v: "+33", l: "France +33" },
  { v: "+49", l: "Germany +49" },
  { v: "+1", l: "United States and Canada +1" },
];

type Errors = Partial<Record<"name" | "phone" | "email", string>>;

function DemoPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("+966");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const opened = useRef(0);
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    opened.current = Date.now();
  }, []);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(name, phone, email);
    setErrors(next);
    setSendError("");
    if (Object.keys(next).length) {
      const order: (keyof Errors)[] = ["name", "phone", "email"];
      const first = order.find((key) => next[key]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    const tooFast = opened.current > 0 && Date.now() - opened.current < 1200;
    if (trap.trim() || tooFast) {
      setDone(true);
      return;
    }
    setSending(true);
    const payload = {
      name: name.trim(),
      phone: `${code}${phone.replace(/\D/g, "")}`,
      email: email.trim(),
    };
    try {
      const netlify = new FormData();
      netlify.append("form-name", "hayvra-demo");
      netlify.append("full-name", payload.name);
      netlify.append("phone", payload.phone);
      netlify.append("email", payload.email);
      const mail = await fetch("https://formsubmit.co/ajax/ahmad.rowaihy@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...payload,
          _subject: "HAYVRA demo request",
          _template: "table",
          _captcha: "false",
        }),
      });
      await fetch("/", { method: "POST", body: netlify }).catch(() => undefined);
      if (!mail.ok) throw new Error("mail");
      saveDemoRequest({ ...payload, at: new Date().toISOString() });
      setDone(true);
    } catch {
      setSendError("The request could not be sent. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <SiteHeader home={false} />
      <main className="px-5 pb-20 pt-32 md:px-8">
        <div className="mx-auto w-full max-w-xl">
          <p className="kicker" lang="en" dir="ltr">
            Request a demo
          </p>
          <h1 className="mt-3 text-4xl font-light md:text-5xl">Request a demo</h1>
          <p className="quiet mt-4">
            Leave a way to reach you. The request is sent to the HAYVRA team.
          </p>
          {done ? (
            <div className="panel mt-10 px-6 py-8">
              <h2 ref={doneRef} tabIndex={-1} className="text-3xl font-light">
                Request received
              </h2>
              <p className="mt-4 leading-relaxed">
                Thank you, {name.trim().split(/\s+/)[0]}. Your request was sent. The team will reply to {email.trim()}.
              </p>
              <Link to="/" className="btn btn-gold mt-8">
                Back to HAYVRA
              </Link>
            </div>
          ) : (
            <form className="mt-10 space-y-5" onSubmit={onSubmit} noValidate>
              <div className="hp" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    name="bot-field"
                  />
                </label>
              </div>
              <div className={errors.name ? "field is-error" : "field"}>
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="full-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name ? (
                  <p id="name-error" role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className={errors.phone ? "field is-error" : "field"}>
                <label htmlFor="phone">Mobile number</label>
                <div className="grid grid-cols-[minmax(8rem,11rem)_1fr] gap-2">
                  <select
                    aria-label="Country code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="tel-country-code"
                  >
                    {CODES.map((item) => (
                      <option key={item.v} value={item.v}>
                        {item.l}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="5xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                    required
                  />
                </div>
                <p id="phone-hint" className="quiet text-sm">
                  The country code is already selected. Enter the local number.
                </p>
                {errors.phone ? (
                  <p id="phone-error" role="alert">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
              <div className={errors.email ? "field is-error" : "field"}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                {errors.email ? (
                  <p id="email-error" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <button type="submit" className="btn btn-gold w-full" disabled={sending}>
                {sending ? "Sending…" : "Send the request"}
              </button>
              {sendError ? (
                <p role="alert" className="text-sm text-red-300">
                  {sendError}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function validate(name: string, phone: string, email: string): Errors {
  const errors: Errors = {};
  const cleanName = name.trim();
  if (cleanName.length < 5 || !/\s/.test(cleanName)) {
    errors.name = "Enter at least a first and last name.";
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 12) {
    errors.phone = "The mobile number is incomplete.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "The email format is not valid.";
  }
  return errors;
}
