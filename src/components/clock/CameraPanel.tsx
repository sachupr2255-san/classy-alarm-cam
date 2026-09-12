import { useCallback, useEffect, useRef, useState } from "react";
import { CameraOff, Video } from "lucide-react";
import type { AlarmPhase } from "@/pages/Clock";

type CameraPanelProps = {
  phase: AlarmPhase;
  /** Motion level 0..~1 (fraction of changed pixels), smoothed by the parent. */
  motionLevel: number;
  onCameraChange: (on: boolean) => void;
  onError: (message: string | null) => void;
  /** Called ~every frame while watching with the raw diff level. */
  onFrame: (level: number) => void;
};

export function CameraPanel({
  phase,
  motionLevel,
  onCameraChange,
  onError,
  onFrame,
}: CameraPanelProps) {
  const [cameraOn, setCameraOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevDataRef = useRef<Uint8ClampedArray | null>(null);
  const watchingRef = useRef(false);
  const onFrameRef = useRef(onFrame);
  const phaseRef = useRef(phase);

  onFrameRef.current = onFrame;
  phaseRef.current = phase;

  const watching = phase === "watching" && cameraOn;

  const stopDetectionLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const detectMotion = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || video.readyState < 2) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.drawImage(video, 0, 0, w, h);
    const current = ctx.getImageData(0, 0, w, h).data;

    const prev = prevDataRef.current;
    if (prev) {
      const px = w * h;
      let changed = 0;
      for (let i = 0; i < px; i++) {
        const o = i * 4;
        const diff =
          Math.abs(current[o] - prev[o]) +
          Math.abs(current[o + 1] - prev[o + 1]) +
          Math.abs(current[o + 2] - prev[o + 2]);
        if (diff > 72) changed++;
      }
      onFrameRef.current(changed / px);
    }
    prevDataRef.current = current;
  }, []);

  const loop = useCallback(() => {
    if (watchingRef.current) {
      detectMotion();
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [detectMotion]);

  const startCamera = async () => {
    onError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
      onCameraChange(true);
    } catch (error) {
      console.error(error);
      onError(
        error instanceof Error && error.name === "NotAllowedError"
          ? "Camera permission was denied — allow access to begin surveillance."
          : "Could not access the camera.",
      );
    }
  };

  const stopCamera = useCallback(() => {
    stopDetectionLoop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    prevDataRef.current = null;
    setCameraOn(false);
    onCameraChange(false);
    onFrameRef.current(0);
  }, [onCameraChange, onError, stopDetectionLoop]);

  // Start/stop the detection loop whenever surveillance should be active.
  useEffect(() => {
    watchingRef.current = watching;
    if (watching) {
      prevDataRef.current = null; // fresh baseline when surveillance begins
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(loop);
      }
    } else if (!watching && rafRef.current !== null && !cameraOn) {
      stopDetectionLoop();
    }
  }, [watching, cameraOn, loop, stopDetectionLoop]);

  // Release the camera when the component unmounts.
  useEffect(() => {
    return () => {
      stopDetectionLoop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [stopDetectionLoop]);

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-card shadow-[0_18px_40px_-24px_oklch(0.3_0.05_60/0.5)] ${
        watching ? "border-alarm/50" : "border-border/80"
      }`}
    >
      <div className="relative aspect-video bg-ink">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {/* Downscaled frame buffer used for motion diffing (never displayed) */}
        <canvas ref={canvasRef} width={64} height={48} className="hidden" />

        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <Video className="size-8 text-brass/60" />
            <p className="font-sc text-sm font-semibold tracking-wide text-brass/80">
              Camera standing by
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-brass/60">
              Motion after the set time rings the bell
            </p>
            <p className="font-display text-base italic text-muted-foreground/80">
              Start the watch — motion after the set time rings the bell
            </p>
          </div>
        )}

        {cameraOn && (
          <div
            className={`font-instrument absolute left-3 top-3 rounded-full border bg-ink/70 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] ${
              watching
                ? "border-alarm/60 text-alarm dot-pulse"
                : "border-brass/50 text-brass"
            }`}
          >
            {watching ? "● Watching" : "Preview"}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-sc text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Watch level
          </p>
          <p className="font-instrument text-[10px] text-muted-foreground">
            {Math.round(motionLevel * 100)}%
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              watching && motionLevel > 0.035 ? "bg-alarm" : "bg-brass/70"
            }`}
            style={{ width: `${Math.min(100, motionLevel * 800)}%` }}
          />
        </div>

        <div className="mt-4 flex gap-2">
          {!cameraOn ? (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-brass transition hover:bg-ink/90"
            >
              <Video className="size-4" />
              Start camera
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60"
            >
              <CameraOff className="size-4" />
              Stop camera
            </button>
          )}
        </div>

        {phase === "armed" && !cameraOn && (
          <p className="font-display mt-3 text-sm italic text-muted-foreground">
            The clock is armed but blind — start the camera to enable the watch.
          </p>
        )}
      </div>
    </div>
  );
}

export default CameraPanel;
