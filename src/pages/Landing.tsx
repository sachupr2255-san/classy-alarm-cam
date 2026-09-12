import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Eye, ShieldCheck, Timer } from "lucide-react";
import { Link } from "react-router";

function MiniDial() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hourDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
  const minuteDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
  const secondDeg = now.getSeconds() * 6;

  const Hand = ({ deg, className }: { deg: number; className: string }) => (
    <div className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
      <div
        className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 rounded-full ${className}`}
      />
    </div>
  );

  return (
    <div className="relative size-64 rounded-full border-4 border-brass/70 bg-ink shadow-[0_24px_60px_-24px_oklch(0.3_0.05_60/0.65),inset_0_2px_10px_oklch(1_0.02_85/0.14)]">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-1.5"
          style={{ transform: `rotate(${i * 6}deg)` }}
        >
          <div
            className={`mx-auto rounded-full ${
              i % 5 === 0 ? "h-3 w-[2px] bg-brass/85" : "h-1.5 w-px bg-brass/30"
            }`}
          />
        </div>
      ))}

      <span className="font-sc absolute left-1/2 top-3.5 -translate-x-1/2 text-xs font-semibold text-brass/90">
        12
      </span>
      <span className="font-sc absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brass/90">
        3
      </span>
      <span className="font-sc absolute bottom-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold text-brass/90">
        6
      </span>
      <span className="font-sc absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brass/90">
        9
      </span>

      <Hand deg={hourDeg} className="h-[24%] w-[4px] bg-brass" />
      <Hand deg={minuteDeg} className="h-[36%] w-[3px] bg-brass/95" />
      <Hand deg={secondDeg} className="h-[40%] w-px bg-brass/70" />

      <div className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass ring-2 ring-ink" />
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/8 via-transparent to-transparent" />
    </div>
  );
}

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="paper-vignette flex min-h-screen flex-col"
    >
      {/* Header */}
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-ink text-brass">
              <Bell className="size-4.5" />
            </div>
            <span className="font-sc text-lg font-semibold tracking-wide">
              Suspicious Alarm Clock
            </span>
          </div>
          <Link
            to="/clock"
            className="font-instrument inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-xs uppercase tracking-[0.2em] text-brass transition hover:bg-ink/90"
          >
            Open the clock
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="font-instrument text-[10px] uppercase tracking-[0.35em] text-brass-strong">
              Desk instrument · One person
            </p>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-[1.05] text-ink md:text-6xl">
              The alarm clock that{" "}
              <em className="brass-gradient-text">watches back</em>.
            </h1>
            <p className="font-display mt-5 max-w-md text-xl italic leading-relaxed text-muted-foreground">
              Set the time. Arm the switch. Step away from your desk — and the
              moment you return, the bell rings. Sound only, nothing else.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/clock"
                className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-medium text-brass transition hover:bg-ink/90"
              >
                <Bell className="size-4" />
                Set your alarm
                <ArrowRight className="size-4" />
              </Link>
              <span className="font-instrument text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Free · Camera stays local
              </span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <MiniDial />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/70">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-14 sm:grid-cols-3">
          {[
            {
              icon: Timer,
              title: "Set the hour",
              text: "Pick the exact minute the watch begins.",
            },
            {
              icon: Eye,
              title: "It watches",
              text: "Your webcam stands guard — motion after the set time rings.",
            },
            {
              icon: Bell,
              title: "The bell rings",
              text: "A synthesized brass bell. Sound only, stop with a click.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-border/80 bg-card p-6 shadow-[0_18px_40px_-28px_oklch(0.3_0.05_60/0.5)]"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-ink text-brass">
                <Icon className="size-4.5" />
              </div>
              <p className="font-sc mt-4 text-lg font-semibold tracking-wide">
                {title}
              </p>
              <p className="font-display mt-1 text-base italic text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/70">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <p className="font-instrument text-center text-[10px] uppercase tracking-[0.35em] text-brass-strong">
            The ritual
          </p>
          <h2 className="font-display mx-auto mt-3 max-w-xl text-center text-3xl font-semibold text-ink">
            Three small acts before you step away
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "I",
                title: "Choose the time",
                text: "The exact minute you want the watch to begin.",
              },
              {
                n: "II",
                title: "Start the camera",
                text: "It watches locally — nothing is recorded or sent anywhere.",
              },
              {
                n: "III",
                title: "Arm the switch",
                text: "Then leave your desk. The bell does the rest.",
              },
            ].map(({ n, title, text }) => (
              <div key={n} className="text-center">
                <div className="font-sc mx-auto flex size-12 items-center justify-center rounded-full border border-brass/50 text-lg font-semibold text-brass-strong">
                  {n}
                </div>
                <p className="font-sc mt-4 text-lg font-semibold tracking-wide">
                  {title}
                </p>
                <p className="font-display mt-1 text-base italic text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <Link
              to="/clock"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-medium text-brass transition hover:bg-ink/90"
            >
              <ShieldCheck className="size-4" />
              Begin surveillance
              <ArrowRight className="size-4" />
            </Link>
            <p className="font-display text-base italic text-muted-foreground">
              Sound only. Nothing recorded. Stop with a click.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <p className="font-sc text-sm font-semibold tracking-wide text-foreground/80">
            Suspicious Alarm Clock
          </p>
          <p className="font-instrument text-[10px] uppercase tracking-[0.25em]">
            MMXXVI
          </p>
        </div>
      </footer>
    </motion.div>
  );
}
