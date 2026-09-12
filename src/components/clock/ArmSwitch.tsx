import { motion } from "framer-motion";

type ArmSwitchProps = {
  armed: boolean;
  disabled: boolean;
  onArm: () => void;
  onDisarm: () => void;
};

/**
 * A brass lever switch. Pull it to arm surveillance, flip it back to disarm.
 * Deliberately small hit area — like a real switch, it is a deliberate act.
 */
export function ArmSwitch({ armed, disabled, onArm, onDisarm }: ArmSwitchProps) {
  const toggle = () => {
    if (disabled) return;
    if (armed) onDisarm();
    else onArm();
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={armed}
      aria-label="Arm surveillance"
      onClick={toggle}
      disabled={disabled}
      className={`relative h-9 w-16 rounded-full border transition-colors duration-200 ${
        armed
          ? "border-alarm/60 bg-alarm/20"
          : "border-border bg-muted"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1/2 size-7 -translate-y-1/2 rounded-full shadow-[0_2px_6px_oklch(0.2_0.03_260/0.4)] ${
          armed ? "left-[calc(100%-2rem)] bg-alarm" : "left-1 bg-brass"
        }`}
      />
    </button>
  );
}
