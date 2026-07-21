"use client";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Reusable for any "are you sure?" moment — deliberately NOT used on
// reversible one-tap toggles (like, save, mute), only on things that lose
// something (a collection, a grouping, a draft) or are mildly consequential
// socially (unfollowing someone).
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden
      />

      <div className="relative w-full max-w-xs rounded-2xl bg-background p-5 text-center shadow-xl">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1.5 text-sm text-foreground/60">{description}</p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-foreground/15 py-2 text-sm font-medium"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              destructive
                ? "bg-red-500 text-white"
                : "bg-foreground text-background"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
