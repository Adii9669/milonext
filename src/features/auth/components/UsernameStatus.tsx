import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  isChecking: boolean;
  isAvailable: boolean | null;
  className?: string;
}

export function UsernameStatus({ isChecking, isAvailable, className = "" }: Props) {
  if (isChecking) {
    return (
      <p
        className={`oa-username-status oa-username-status--checking flex items-center gap-1.5 px-1 text-xs font-medium ${className}`}
        aria-live="polite"
      >
        <Loader2 size={13} className="animate-spin" />
        Checking handle availability…
      </p>
    );
  }

  if (isAvailable === true) {
    return (
      <p
        className={`oa-username-status oa-username-status--available flex items-center gap-1.5 px-1 text-xs font-semibold ${className}`}
        aria-live="polite"
      >
        <CheckCircle2 size={13} />
        Username available
      </p>
    );
  }

  if (isAvailable === false) {
    return (
      <p
        className={`oa-username-status oa-username-status--taken flex items-center gap-1.5 px-1 text-xs font-semibold ${className}`}
        aria-live="polite"
      >
        <XCircle size={13} />
        Username already taken
      </p>
    );
  }

  return null;
}
