/**
 * Synthesized alarm bell — a heavy brass hand-bell rung repeatedly.
 * Pure WebAudio, so there is no audio file to host and nothing to download.
 * Browsers require a user gesture before audio may start; the "Arm" and
 * "Ring now" buttons both provide that gesture via ensureBellAudio().
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor!();
  }
  return ctx;
}

/** Call once from a user gesture so later programmatic ringing is allowed. */
export function ensureBellAudio() {
  const audio = getCtx();
  if (audio.state === "suspended") {
    void audio.resume();
  }
}

/** One strike of a brass hand-bell: bright partials + a soft metallic shimmer. */
function strike(time: number, out: AudioNode) {
  const audio = getCtx();

  // Principal partials of a struck bell (decaying from top to bottom).
  const partials: Array<[number, number, number]> = [
    // [frequency, gain, decay seconds]
    [1568, 0.5, 1.2],
    [2093, 0.42, 1.0],
    [2637, 0.26, 0.8],
    [3136, 0.2, 0.6],
    [784, 0.34, 1.6],
  ];

  for (const [freq, gain, decay] of partials) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(g).connect(out);
    osc.start(time);
    osc.stop(time + decay + 0.1);
  }

  // Short inharmonic shimmer for the metallic attack.
  const shimmer = audio.createBufferSource();
  const length = Math.floor(audio.sampleRate * 0.25);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  const bandpass = audio.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 4200;
  bandpass.Q.value = 2.5;
  const shimmerGain = audio.createGain();
  shimmerGain.gain.value = 0.12;
  shimmer.buffer = buffer;
  shimmer.connect(bandpass).connect(shimmerGain).connect(out);
  shimmer.start(time);
}

export type BellRinger = {
  /** Start ringing until stop() is called. */
  start: () => void;
  /** Stop ringing immediately. */
  stop: () => void;
};

/**
 * Create a bell ringer. Strikes are routed through a private gain node, so
 * stop() simply disconnects it — silence, no matter how many strikes were
 * scheduled ahead.
 */
export function startBell(): BellRinger {
  const audio = getCtx();
  ensureBellAudio();

  let master: GainNode | null = null;
  let stopped = false;

  return {
    start: () => {
      if (stopped) return;
      master = audio.createGain();
      master.gain.value = 0.5;
      master.connect(audio.destination);
      const begin = audio.currentTime + 0.05;
      for (let i = 0; i < 120; i++) {
        strike(begin + i * 0.55, master);
      }
    },
    stop: () => {
      stopped = true;
      if (master) {
        master.gain.setValueAtTime(0, audio.currentTime);
        master.disconnect();
        master = null;
      }
    },
  };
}

/** Brief confirmation chime when the alarm is armed. */
export function armChime() {
  ensureBellAudio();
  const audio = getCtx();
  const t = audio.currentTime + 0.03;
  const notes: Array<[number, number]> = [
    [1046.5, 0],
    [1318.5, 0.14],
  ];
  for (const [freq, offset] of notes) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + offset);
    g.gain.linearRampToValueAtTime(0.16, t + offset + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.6);
    osc.connect(g).connect(audio.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.7);
  }
}
