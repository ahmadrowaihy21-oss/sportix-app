import { Button } from "@/components/ui/button";
import type { MediaSubject } from "@/lib/go-sportix/types";

export function MediaPreview({
  url,
  type,
  subject,
  onChange,
}: {
  url: string;
  type: "photo" | "video";
  subject: MediaSubject;
  onChange?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-lime/40 bg-surface">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">Media evidence ✓</p>
        <p className="text-3xs text-muted">
          Type: {subject} · Session bound: YES
        </p>
      </div>
      {type === "video" ? (
        <video src={url} controls className="aspect-photo w-full bg-bg object-cover" />
      ) : (
        <img src={url} alt="Attached activity evidence" className="aspect-photo w-full object-cover" />
      )}
      {onChange ? (
        <div className="p-3">
          <Button variant="outline" className="w-full" onClick={onChange}>
            CHANGE PHOTO
          </Button>
        </div>
      ) : null}
    </div>
  );
}
