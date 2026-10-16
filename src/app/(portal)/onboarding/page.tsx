import Link from "next/link";
import { OnboardingQuizButton } from "@/components/OnboardingQuizButton";
import { RichText } from "@/components/RichText";
import { ContactNumber } from "@/components/ContactNumber";
import {
  CONDUCT,
  CODE_OF_CONDUCT_URL,
  MISSION_VISION_URL,
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
  type Perk,
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

function PerkIcon({ icon, className }: { icon: Perk["icon"]; className?: string }) {
  const paths: Record<Perk["icon"], string[]> = {
    ticket: [
      "M3 9a2 2 0 0 0 0 6v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-6V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z",
      "M13 5v14",
    ],
    boat: [
      "M2 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0",
      "M5 15l1-6h12l1 6",
      "M12 9V3l4 3",
    ],
    music: [
      "M9 18V5l11-2v13",
      "M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
      "M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
    ],
    people: [
      "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1",
      "M17 11a3 3 0 1 0 0-6",
      "M22 20v-1a5 5 0 0 0-4-4.9",
    ],
    shirt: [
      "M8 3l-6 4 3 4 3-1.5V21h8V9.5L19 11l3-4-6-4a4 4 0 0 1-8 0z",
    ],
  };
  return (
    <span className={`flex shrink-0 items-center justify-center ${className ?? ""}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-1/2 w-1/2"
        aria-hidden="true"
      >
        {paths[icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
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
            <a
              href={MISSION_VISION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full border border-cyan-300/50 px-4 py-1.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-300/10"
            >
              Read our full mission and vision &rarr;
            </a>
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
          <figure className="mb-6 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ON_THE_DAY.map.src}
              alt={ON_THE_DAY.map.alt}
              className="w-full bg-[#f1f0ef]"
            />
            <figcaption className="p-5">
              <p className="font-semibold">{ON_THE_DAY.map.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                {ON_THE_DAY.map.body}
              </p>
              <ol className="mt-4 flex flex-col gap-2.5">
                {ON_THE_DAY.map.route.map((line, index) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-white/85">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300 text-xs font-bold text-cyan-300">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
              <a
                href={ON_THE_DAY.map.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block rounded-full border border-cyan-300/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
              >
                {ON_THE_DAY.map.label} &rarr;
              </a>
            </figcaption>
          </figure>
          <Steps steps={ON_THE_DAY.steps} />
          <div className="mt-4 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-4">
            <p className="font-semibold text-cyan-100">Late shift?</p>
            <p className="mt-1 text-sm leading-relaxed text-white/80">
              Pick up your badge early and enjoy Tectonic before you start.
            </p>
          </div>
        </section>

        {/* Where is what */}
        <section id="rooms" className="scroll-mt-24">
          <SectionTitle eyebrow="KNOW THE ROOMS" title={VENUE_GUIDE.title} />
          <p className="mb-4 text-sm leading-relaxed text-white/70">
            <Text>{VENUE_GUIDE.intro}</Text>
          </p>
          <figure className="mb-4 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={VENUE_GUIDE.plan.src}
              alt={VENUE_GUIDE.plan.alt}
              className="w-full bg-[#f1f0ef]"
            />
            <figcaption className="p-4 text-xs leading-relaxed text-white/60">
              {VENUE_GUIDE.plan.caption}
            </figcaption>
          </figure>
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
          <div className="flex flex-col gap-3">
            {PERKS.items.slice(0, 1).map((perk) => (
              <div
                key={perk.id}
                className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#1141E9]/45 via-[#7631DC]/25 to-[#0D1341]/60 p-6 shadow-[0_18px_50px_-24px_#1141E9]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/15 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <PerkIcon icon={perk.icon} className="h-14 w-14 rounded-2xl bg-white/15 text-cyan-200" />
                  <div>
                    {perk.tag && (
                      <span className="inline-block rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                        {perk.tag}
                      </span>
                    )}
                    <p className="mt-2 text-xl font-semibold">{perk.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">
                      <Text>{perk.body}</Text>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              {PERKS.items.slice(1).map((perk) => (
                <div
                  key={perk.id}
                  className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md"
                >
                  <PerkIcon icon={perk.icon} className="h-11 w-11 rounded-xl bg-cyan-300/10 text-cyan-300" />
                  <div className="flex-1">
                    <p className="font-semibold">{perk.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">
                      <Text>{perk.body}</Text>
                    </p>
                  </div>
                  {perk.tag && (
                    <span className="self-start rounded-full border border-white/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
                      {perk.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
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
          <a
            href={CODE_OF_CONDUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full border border-cyan-300/50 px-4 py-1.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-300/10"
          >
            Read the full code of conduct &rarr;
          </a>
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
              <span className="ml-2 inline-block rounded-full border border-cyan-300/50 px-3 py-0.5 align-middle text-xs font-semibold uppercase tracking-wider text-cyan-300">
                via WhatsApp
              </span>
            </p>
            <p className="mt-1 text-xs text-white/55">
              Tap the number to open WhatsApp, then use the message or call button there.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CONTACTS.channels.map((channel) => (
                <div key={channel.title} className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                    {channel.title}
                  </p>
                  <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-white/75">
                    {channel.items.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                        <span>
                          <Text>{line}</Text>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <OnboardingQuizButton />
      </div>
    </div>
  );
}
