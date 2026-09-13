import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-1 border-b border-border bg-bg/92 px-1 backdrop-blur-md">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg hover:bg-elevated"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
      ) : (
        <span className="w-2" />
      )}
      <div className="min-w-0 flex-1">
        <h1 className={cn("truncate text-sm font-semibold tracking-tight")}>{title}</h1>
        {subtitle ? <p className="truncate text-2xs text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex min-w-11 items-center justify-end">{right}</div>
    </header>
  );
}
