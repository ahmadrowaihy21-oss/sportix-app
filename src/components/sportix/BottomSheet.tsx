import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  height = "mid",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: "mid" | "tall";
}) {
  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && onClose()} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-bg/75" />
        <Drawer.Content
          aria-label={title}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-3xl flex-col rounded-t-2xl border-t border-border bg-surface shadow-sheet outline-none",
            height === "tall" ? "h-sheet-tall" : "h-sheet",
          )}
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-strong" />
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <Drawer.Title className="text-sm font-semibold tracking-tight">{title}</Drawer.Title>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
