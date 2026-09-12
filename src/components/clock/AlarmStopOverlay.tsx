type AlarmStopOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Full-screen modal that appears while the bell rings. Clicking anywhere
 * discharges the alarm — the quickest possible escape hatch.
 */
export function AlarmStopOverlay({
  open,
  onOpenChange,
}: AlarmStopOverlayProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-ink/85 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="bell-shake text-6xl">🔔</div>
        <p className="font-sc brass-gradient-text text-2xl font-semibold tracking-[0.3em]">
          RING RING
        </p>
        <p className="font-display max-w-md text-xl italic text-brass/80">
          “Motion has been detected in the study.”
        </p>
        <span className="font-instrument mt-6 rounded-full border border-brass/50 px-6 py-2 text-xs uppercase tracking-[0.3em] text-brass/90">
          Click anywhere to silence
        </span>
      </div>
    </div>
  );
}

export default AlarmStopOverlay;
