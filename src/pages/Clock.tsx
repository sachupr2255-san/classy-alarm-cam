import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, ShieldCheck, Video } from "lucide-react";
import { ArmSwitch } from "@/components/clock/ArmSwitch";
import { CameraPanel } from "@/components/clock/CameraPanel";
import { AlarmDial } from "@/components/clock/AlarmDial";
import { AlarmStopOverlay } from "@/components/clock/AlarmStopOverlay";
import {
  armChime,
  ensureBellAudio,
  startBell,
  type BellRinger,
} from "@/lib/alarmBell";

/**
 * Phases:
 *  idle     — nothing set
 *  armed    — switch is on, waiting for the set time
 *  watching — past the set time; camera surveillance active, motion rings
 *  ringing  — the bell is ringing
 *  disarmed — the alarm fired and was silenced; flip the switch to re-arm
 */
export type AlarmPhase =
  | "idle"
  | "armed"
  | "watching"
  | "ringing"
  | "disarmed";

const MOTION_THRESHOLD = 0.055;

export default function Clock() {
  const [alarmTime, setAlarmTime] = useState("07:30");
  const [phase, setPhase] = useState<AlarmPhase>("idle");
  const [motionLevel, setMotionLevel] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const ringerRef = useRef<BellRinger | null>(null);

  const stopRinger = useCallback(() => {
    ringerRef.current?.stop();
    ringerRef.current = null;
  }, []);

  // Silencing the overlay discharges the alarm.
  const silenceAlarm = useCallback(() => {
    stopRinger();
    setPhase("disarmed");
  }, [stopRinger]);

  // ---- Motion trigger --------------------------------------------------------
  const handleFrame = useCallback(
    (level: number) => {
      setMotionLevel((prev) => prev * 0.65 + level * 0.35);
      if (level > MOTION_THRESHOLD) {
        setPhase((current) => {
          if (current !== "watching") return current;
          const ringer = startBell();
          ringer.start();
          ringerRef.current = ringer;
          return "ringing";
        });
      }
    },
    [],
  );

  // ---- Clock tick ------------------------------------------------------------
  // While armed, once the set time is reached, surveillance goes live.
  useEffect(() => {
    if (phase !== "armed") return;
    const check = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
      if (hhmm >= alarmTime) {
        setPhase("watching");
      }
    };
    check();
    const id = window.setInterval(check, 1000);
    return () => window.clearInterval(id);
  }, [phase, alarmTime]);

  // Stop the bell if the page is left mid-ring.
  useEffect(() => stopRinger, [stopRinger]);

  // ---- Switch ----------------------------------------------------------------
  const arm = () => {
    ensureBellAudio();
    armChime();
    setMotionLevel(0);
    setPhase("armed");
  };

  const disarm = () => {
    stopRinger();
    setMotionLevel(0);
    setPhase("idle");
  };

  const watching = phase === "watching" && cameraOn;

  const statusLine = (() => {
    switch (phase) {
      case "idle":
        return cameraOn
          ? "Camera watching. Arm the alarm to begin."
          : "No alarm set. Choose a time, start the camera, arm the switch.";
      case "armed":
        return `Armed for ${alarmTime}. At the set time, any motion rings.`;
      case "watching":
        return cameraOn
          ? "Surveillance is live. Stillness, please — any motion rings the bell."
          : "The set time has passed, but the camera is off. Start it to enable the watch.";
      case "ringing":
        return "MOTION DETECTED. The bell is ringing.";
      case "disarmed":
        return "Alarm discharged. Flip the switch to arm again.";
    }
  })();

  return (
    <main
      className={`paper-vignette flex min-h-screen flex-col text-foreground ${
        phase === "ringing" ? "alarm-flash" : ""
      }`}
    >
      {/* Top bar */}
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-ink text-brass">
              <BellRing
                className={`size-4.5 ${phase === "ringing" ? "bell-shake" : ""}`}
              />
            </div>
            <div>
              <p className="font-sc text-lg font-semibold leading-none tracking-wide">
                Suspicious Alarm Clock
              </p>
              <p className="font-instrument mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Motion surveillance · Desk model
              </p>
            </div>
          </div>
          <StatusPill phase={phase} />
        </div>
      </header>

      {/* Instrument panel */}
      <div className="flex-1">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-14">
          {/* Left column: dial + controls */}
          <section className="flex flex-col items-center gap-8">
            <AlarmDial phase={phase} alarmTime={alarmTime} watching={watching} />

            <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card p-5 shadow-[0_18px_40px_-24px_oklch(0.3_0.05_60/0.5)]">
              <label
                htmlFor="alarm-time"
                className="font-sc text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              >
                Alarm time
              </label>
              <div className="mt-3 flex items-baseline gap-3">
                <input
                  id="alarm-time"
                  type="time"
                  value={alarmTime}
                  onChange={(event) => {
                    setAlarmTime(event.target.value);
                    if (phase === "watching" || phase === "disarmed") {
                      setPhase("armed");
                    }
                  }}
                  disabled={phase === "ringing"}
                  className="font-instrument w-full bg-transparent text-3xl font-medium text-ink outline-none [color-scheme:light] disabled:opacity-50"
                />
                <span className="font-sc text-sm text-muted-foreground">
                  local
                </span>
              </div>

              <div className="brass-rule my-5 h-px" />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-sc text-sm font-semibold">
                    Surveillance switch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {phase === "idle" || phase === "disarmed"
                      ? "Arm when ready at your desk"
                      : "Flip back to stand down"}
                  </p>
                </div>
                <ArmSwitch
                  armed={phase === "armed" || phase === "watching"}
                  disabled={phase === "ringing"}
                  onArm={arm}
                  onDisarm={disarm}
                />
              </div>
            </div>
          </section>

          {/* Right column: camera */}
          <section className="flex flex-col gap-4">
            <CameraPanel
              phase={phase}
              motionLevel={motionLevel}
              onCameraChange={setCameraOn}
              onError={setCameraError}
              onFrame={handleFrame}
            />
            <StatusPlaque phase={phase} statusLine={statusLine} />
          </section>
        </div>
      </div>

      {/* Footnote */}
      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Video className="size-3.5 text-brass-strong" />
            Frames stay on this machine
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-brass-strong" />
            Sound only — nothing is recorded
          </span>
        </div>
      </footer>

      <AlarmStopOverlay open={phase === "ringing"} onOpenChange={(open) => {
        if (!open) silenceAlarm();
      }} />
    </main>
  );
}

function StatusPill({ phase }: { phase: AlarmPhase }) {
  const map: Record<AlarmPhase, { label: string; tone: string }> = {
    idle: {
      label: "Standing by",
      tone: "border-border bg-muted text-muted-foreground",
    },
    armed: {
      label: "Armed",
      tone: "border-brass/60 bg-brass/15 text-brass-strong",
    },
    watching: {
      label: "Watching",
      tone: "border-alarm/60 bg-alarm/15 text-alarm",
    },
    ringing: {
      label: "Ringing",
      tone: "border-alarm/60 bg-alarm/15 text-alarm dot-pulse",
    },
    disarmed: {
      label: "Discharged",
      tone: "border-border bg-muted text-muted-foreground",
    },
  };
  const { label, tone } = map[phase];
  return (
    <span
      className={`font-instrument rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${tone}`}
    >
      {label}
    </span>
  );
}

function StatusPlaque({
  phase,
  statusLine,
}: {
  phase: AlarmPhase;
  statusLine: string;
}) {
  return (
    <motion.div
      key={statusLine}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-border/70 bg-card px-4 py-3"
    >
      <p className="font-sc text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Status
      </p>
      <p
        className={`font-display mt-1 text-lg leading-snug ${
          phase === "ringing"
            ? "font-semibold text-alarm"
            : "italic text-foreground"
        }`}
      >
        {statusLine}
      </p>
    </motion.div>
  );
}
