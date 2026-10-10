import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  isChecking: boolean;
  isAvailable: boolean | null;
}

export function UsernameStatus({ isChecking, isAvailable }: Props) {
  if (isChecking) {
    return (
      <p className="flex items-center gap-1.5 px-1 text-xs text-text-muted font-medium" aria-live="polite">
        <Loader2 size={12} className="animate-spin" />
        Checking username…
      </p>
    );
  }

  if (isAvailable === true) {
    return (
      <p className="flex items-center gap-1.5 px-1 text-xs text-success font-semibold" aria-live="polite">
        <CheckCircle2 size={12} />
        Username available
      </p>
    );
  }

  if (isAvailable === false) {
    return (
      <p className="flex items-center gap-1.5 px-1 text-xs text-error font-semibold" aria-live="polite">
        <XCircle size={12} />
        Username already taken
      </p>
    );
  }

  return null;
}
