import {
  ACADEMY_CV,
  ACADEMY_GLOSSARY,
  ACADEMY_INTRO,
  ACADEMY_PARTNERS,
  ACADEMY_PROGRAMME,
  ACADEMY_ROOM,
} from "@/data/academy";

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}

export default function AcademyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050A2B] px-6 pt-24 pb-10 text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 10% 0%, rgba(17,65,233,0.38), transparent 60%)," +
            "radial-gradient(ellipse 50% 35% at 100% 60%, rgba(118,49,220,0.22), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex max-w-2xl flex-col gap-12">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            {ACADEMY_INTRO.eyebrow.toUpperCase()}
          </p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight">
            {ACADEMY_INTRO.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            {ACADEMY_INTRO.body}
          </p>
          <a
            href="#cv"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            CV session and feedback <span aria-hidden="true">&darr;</span>
          </a>
        </header>

        <section>
          <SectionTitle eyebrow="THE EVENT" title={ACADEMY_PROGRAMME.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            {ACADEMY_PROGRAMME.intro}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACADEMY_PROGRAMME.items.map((item) => (
              <Card key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="THE PEOPLE" title={ACADEMY_ROOM.title} />
          <div className="grid gap-3 sm:grid-cols-2">
            {ACADEMY_ROOM.items.map((item) => (
              <Card key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="THE PARTNERS" title={ACADEMY_PARTNERS.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            {ACADEMY_PARTNERS.intro}
          </p>
          <div className="flex flex-col gap-3">
            {ACADEMY_PARTNERS.tiers.map((tier) => (
              <div
                key={tier.title}
                className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4"
              >
                <p className="font-semibold">{tier.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">
                  {tier.body}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tier.names.map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-white/85"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="THE LANGUAGE" title={ACADEMY_GLOSSARY.title} />
          <p className="mb-6 text-sm leading-relaxed text-white/70">
            {ACADEMY_GLOSSARY.intro}
          </p>
          <div className="flex flex-col gap-8">
            {ACADEMY_GLOSSARY.groups.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
                  {group.title}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.terms.map((item) => (
                    <Card
                      key={item.term}
                      title={item.term}
                      body={item.definition}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cv" className="scroll-mt-24 pb-6">
          <SectionTitle eyebrow={ACADEMY_CV.eyebrow} title={ACADEMY_CV.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            {ACADEMY_CV.intro}
          </p>

          <div className="rounded-3xl border border-cyan-300/30 bg-cyan-300/5 p-5">
            <p className="font-semibold">{ACADEMY_CV.session.title}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
              {ACADEMY_CV.session.meta}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {ACADEMY_CV.session.body}
            </p>
            <a
              href={ACADEMY_CV.session.meet.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              {ACADEMY_CV.session.meet.label} &rarr;
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Do
              </p>
              <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-white/75">
                {ACADEMY_CV.dos.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                Don&apos;t
              </p>
              <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-white/75">
                {ACADEMY_CV.donts.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md">
            <p className="font-semibold">Checklist before you send it</p>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-white/75 sm:grid-cols-2">
              {ACADEMY_CV.checklist.map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 rounded-md border border-cyan-300/60"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md">
            <p className="font-semibold">{ACADEMY_CV.example.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              {ACADEMY_CV.example.intro}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#0D1341]/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Before
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {ACADEMY_CV.example.before}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-300/30 bg-[#0D1341]/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  After
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  {ACADEMY_CV.example.after}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {ACADEMY_CV.example.note}
            </p>
          </div>

          <div className="mt-4 rounded-3xl border border-cyan-300/30 bg-cyan-300/5 p-5">
            <p className="font-semibold">{ACADEMY_CV.feedback.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {ACADEMY_CV.feedback.body}
            </p>
            <a
              href={ACADEMY_CV.feedback.cta.href}
              className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              {ACADEMY_CV.feedback.cta.label} &rarr;
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
