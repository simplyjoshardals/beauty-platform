"use client";

type Props = {
  toneTag: string;
  onToneTagChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
};

export function AboutStep({
  toneTag,
  onToneTagChange,
  bio,
  onBioChange,
}: Props) {
  return (
    <div className="text-center">
      <h1 className="text-lg font-semibold">Tell people about yourself</h1>
      <p className="mt-2 text-sm text-foreground/50">
        Optional, but it helps others find relevant content and creators.
      </p>

      <div className="mt-8 text-left">
        <label className="mb-1.5 block text-xs text-foreground/50">
          Skin tone / type
        </label>
        <input
          value={toneTag}
          onChange={(e) => onToneTagChange(e.target.value)}
          placeholder="e.g. Combination skin"
          className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2.5 text-sm outline-none"
        />
      </div>

      <div className="mt-5 text-left">
        <label className="mb-1.5 block text-xs text-foreground/50">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          rows={3}
          placeholder="Tell people about yourself…"
          className="w-full resize-none rounded-lg border border-foreground/15 bg-transparent p-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}
