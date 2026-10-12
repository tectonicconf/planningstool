import Link from "next/link";
import { RichText } from "@/components/RichText";
import { ContactNumber } from "@/components/ContactNumber";
import {
  CONDUCT,
  CONTACTS,
  COMING_UP,
  DAY_GLANCE,
  NEXT_STEPS,
  ON_THE_DAY,
  ONBOARDING_INTRO,
  PERKS,
  TIMELINE,
  WHY_VOLUNTEER,
  VENUE_GUIDE,
  type Step,
} from "@/data/onboarding";

// Anything in the data file that starts with "[" is a placeholder. Show it in
// amber so it's obvious what still needs to be written. Everything else
// supports **bold** markup.
function Text({ children }: { children: string }) {
  if (children.startsWith("[")) {
    return (
      <span className="rounded-md border border-dashed border-amber-300/50 bg-amber-300/10 px-1.5 py-0.5 text-amber-200">
        {children}
      </span>
    );
  }
  return <RichText>{children}</RichText>;
}

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

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-300/10 text-sm font-bold text-cyan-200">
              {index + 1}
            </span>
            {index < steps.length - 1 && (
              <span className="mt-1 w-px flex-1 bg-blue-400/25" />
            )}
          </div>
          <div className="flex-1 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4">
            <p className="font-semibold">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              <Text>{step.body}</Text>
            </p>
            {step.link &&
              (step.link.href.startsWith("/") ? (
                <Link
                  href={step.link.href}
                  className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  {step.link.label} →
                </Link>
              ) : (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  {step.link.label} →
                </a>
              ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Card({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4">
      <p className="font-semibold">
        {icon && <span className="mr-2">{icon}</span>}
        <Text>{title}</Text>
      </p>
      <p className="mt-1 text-sm leading-relaxed text-white/70">
        <Text>{body}</Text>
      </p>
    </div>
  );
}

function Check() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-300">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3"
        aria-hidden="true"
      >
        <path d="M5 12l5 5L20 7" />
      </svg>
    </span>
  );
}

export default function OnboardingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050A2B] px-6 py-10 text-white">
      {/* ambient glow, same look as the home page */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 10% 0%, rgba(17,65,233,0.38), transparent 60%)," +
            "radial-gradient(ellipse 50% 35% at 100% 60%, rgba(118,49,220,0.22), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex max-w-2xl flex-col gap-12">
        {/* Hero */}
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            {ONBOARDING_INTRO.eyebrow.toUpperCase()}
          </p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight tracking-tight">
            {ONBOARDING_INTRO.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            <Text>{ONBOARDING_INTRO.body}</Text>
          </p>
        </header>

        {/* Mission and vision */}
        <section>
          <SectionTitle eyebrow={WHY_VOLUNTEER.eyebrow} title={WHY_VOLUNTEER.title} />
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md">
            <p className="text-xl font-semibold leading-snug sm:text-2xl">
              {WHY_VOLUNTEER.lead}
            </p>
            <div className="mt-5 flex flex-col gap-4">
              {WHY_VOLUNTEER.paragraphs.map((paragraph) => (
                <div key={paragraph.label}>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                    {paragraph.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    {paragraph.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Event timeline */}
        <section>
          <SectionTitle eyebrow="THE EVENT" title={TIMELINE.title} />
          <ol className="flex flex-col gap-4">
            {TIMELINE.items.map((item, index) => (
              <li key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-500/20 text-center">
                    <span className="text-xl font-semibold leading-none">
                      {item.date}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                      {item.month}
                    </span>
                  </div>
                  {index < TIMELINE.items.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-blue-400/25" />
                  )}
                </div>
                <div className="flex-1 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    <Text>{item.body}</Text>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Before the event */}
        <section>
          <SectionTitle eyebrow="BEFORE THE EVENT" title="Your next steps" />
          <Steps steps={NEXT_STEPS} />
        </section>

        {/* Coming up: crew events and sessions before the event */}
        <section>
          <SectionTitle eyebrow="ALL DATES" title={COMING_UP.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            <Text>{COMING_UP.intro}</Text>
          </p>
          <ol className="flex flex-col gap-4">
            {COMING_UP.items.map((item, index) => (
              <li key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-500/20 text-center">
                    <span
                      className={`font-semibold leading-none ${
                        item.day.length > 2 ? "text-sm" : "text-xl"
                      }`}
                    >
                      {item.day}
                    </span>
                    {item.month && (
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                        {item.month}
                      </span>
                    )}
                  </div>
                  {index < COMING_UP.items.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-blue-400/25" />
                  )}
                </div>
                <div className="flex-1 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    {item.meta}
                  </p>
                  {item.tag && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
                      {item.tag}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    <Text>{item.body}</Text>
                  </p>
                  {item.link && (
                    <a
                      href={item.link.href}
                      {...(item.link.href.startsWith("/")
                        ? {}
                        : { target: "_blank", rel: "noreferrer" })}
                      className="mt-3 inline-block text-sm font-medium text-cyan-300 hover:text-cyan-200"
                    >
                      {item.link.label} →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* The day itself: map + steps */}
        <section>
          <SectionTitle eyebrow="ON THE DAY" title={ON_THE_DAY.title} />
          <div className="mb-6 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ON_THE_DAY.mapSrc}
              alt={ON_THE_DAY.mapAlt}
              className="w-full"
            />
          </div>
          <Steps steps={ON_THE_DAY.steps} />
        </section>

        {/* Where is what */}
        <section id="rooms" className="scroll-mt-24">
          <SectionTitle eyebrow="KNOW THE ROOMS" title={VENUE_GUIDE.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            <Text>{VENUE_GUIDE.intro}</Text>
          </p>
          <div className="flex flex-col gap-4">
            {VENUE_GUIDE.venues.map((venue) => (
              <div
                key={venue.name}
                className="rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md"
              >
                <p className="text-lg font-semibold">{venue.name}</p>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                  {venue.address}
                </p>
                <p className="mt-1 text-sm text-white/60">{venue.note}</p>
                <ul className="mt-4 flex flex-col divide-y divide-white/10">
                  {venue.rooms.map((room) => (
                    <li key={room.name} className="py-3 first:pt-0 last:pb-0">
                      <p className="font-semibold">{room.name}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">
                        {room.where}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">
                        {room.what}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            {VENUE_GUIDE.note}{" "}
            <a
              href={VENUE_GUIDE.link.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-300 hover:text-cyan-200"
            >
              {VENUE_GUIDE.link.label} →
            </a>
          </p>
        </section>

        {/* The day at a glance */}
        <section id="day">
          <SectionTitle eyebrow="RUN OF SHOW" title={DAY_GLANCE.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            {DAY_GLANCE.intro}
          </p>
          <div className="flex flex-col gap-4">
            {DAY_GLANCE.days.map((day) => (
              <div
                key={day.label}
                className="rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md"
              >
                <p className="text-lg font-semibold">{day.label}</p>
                <ul className="mt-3 flex flex-col divide-y divide-white/10">
                  {day.items.map((item) => (
                    <li
                      key={item.time + item.title}
                      className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4"
                    >
                      <span className="shrink-0 text-sm font-bold text-cyan-300 sm:w-32">
                        {item.time}
                      </span>
                      <span>
                        <span className="block font-semibold">{item.title}</span>
                        <span className="block text-sm text-white/60">
                          {item.place}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/60">{DAY_GLANCE.note}</p>
        </section>

        {/* Perks */}
        <section>
          <SectionTitle eyebrow="THANK YOU" title={PERKS.title} />
          <div className="grid gap-3 sm:grid-cols-2">
            {PERKS.items.map((perk) => (
              <Card
                key={perk.id}
                title={perk.title}
                body={perk.body}
              />
            ))}
          </div>
        </section>

        {/* Code of conduct */}
        <section>
          <SectionTitle eyebrow="HOW WE WORK" title={CONDUCT.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            {CONDUCT.intro}
          </p>
          <ul className="flex flex-col gap-3">
            {CONDUCT.items.map((item) => (
              <li
                key={item.title}
                className="flex gap-3 rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4"
              >
                <Check />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Contacts */}
        <section id="contact" className="scroll-mt-24 pb-6">
          <SectionTitle eyebrow="NEED HELP?" title={CONTACTS.title} />
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/5 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
              General contacts
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CONTACTS.people.map((person) => (
                <div key={person.name} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="mx-auto aspect-square w-full max-w-[120px] rounded-full object-cover ring-2 ring-cyan-300/40"
                  />
                  <p className="mt-2 text-sm font-semibold leading-tight">
                    {person.name}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 leading-relaxed text-white/85">
              {CONTACTS.body}
            </p>
            <p className="mt-3 text-2xl font-bold">
              <ContactNumber number={CONTACTS.number} />
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-white/70">
              {CONTACTS.when.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  <span>
                    <Text>{line}</Text>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
