import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import type { AlarmPhase } from "@/pages/Clock";

type AlarmDialProps = {
  phase: AlarmPhase;
  alarmTime: string;
  watching: boolean;
};

function Hand({
  deg,
  className,
}: {
  deg: number;
  className: string;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{ transform: `rotate(${deg}deg)` }}
    >
      <div
        className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 rounded-full ${className}`}
      />
    </div>
  );
}

export function AlarmDial({ phase, alarmTime, watching }: AlarmDialProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ringing = phase === "ringing";
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourDeg = (hours + minutes / 60) * 30;
  const minuteDeg = (minutes + seconds / 60) * 6;
  const secondDeg = seconds * 6;

  return (
    <div
      className={`relative h-64 w-64 rounded-full border-4 border-brass/70 bg-ink shadow-[0_24px_60px_-24px_oklch(0.3_0.05_60/0.65),inset_0_2px_10px_oklch(1_0.02_85/0.14)] md:h-72 md:w-72 ${
        ringing ? "ring-2 ring-alarm/70 ring-offset-4 ring-offset-background" : ""
      }`}
    >
      {/* Watch pulse */}
      {watching && !ringing && (
        <div className="dot-pulse pointer-events-none absolute inset-2 rounded-full ring-1 ring-alarm/50" />
      )}

      {/* Tick ring */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-1.5"
          style={{ transform: `rotate(${i * 6}deg)` }}
        >
          <div
            className={`mx-auto rounded-full ${
              i % 5 === 0
                ? "h-3 w-[2px] bg-brass/85"
                : "h-1.5 w-px bg-brass/30"
            }`}
          />
        </div>
      ))}

      {/* Numerals */}
      <span className="font-sc absolute left-1/2 top-4 -translate-x-1/2 text-xs font-semibold text-brass/90">
        12
      </span>
      <span className="font-sc absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-brass/90">
        3
      </span>
      <span className="font-sc absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-brass/90">
        6
      </span>
      <span className="font-sc absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-brass/90">
        9
      </span>

      {/* Maker's mark */}
      <BellRing
        className={`absolute left-1/2 top-9 size-4 -translate-x-1/2 text-brass/60 ${
          ringing ? "bell-shake text-alarm" : ""
        }`}
      />

      {/* Hands */}
      <Hand
        deg={hourDeg}
        className="h-[24%] w-[4px] bg-brass shadow-[0_0_6px_oklch(0.66_0.1_80/0.5)]"
      />
      <Hand
        deg={minuteDeg}
        className="h-[36%] w-[3px] bg-brass/95"
      />
      <Hand
        deg={secondDeg}
        className={`h-[40%] w-px ${ringing ? "bg-alarm" : "bg-brass/70"}`}
      />

      {/* Center cap */}
      <div className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass ring-2 ring-ink" />

      {/* Alarm chip */}
      <div className="font-instrument absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[10px] tracking-[0.2em] text-brass/75">
        {watching && !ringing && (
          <span className="dot-pulse inline-block size-1.5 rounded-full bg-alarm" />
        )}
        <span className={ringing ? "text-alarm" : ""}>
          ALARM {alarmTime}
        </span>
      </div>

      {/* Glass sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/8 via-transparent to-transparent" />
    </div>
  );
}
