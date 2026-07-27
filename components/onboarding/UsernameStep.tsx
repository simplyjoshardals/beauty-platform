"use client";

type Props = {
  username: string;
  onUsernameChange: (value: string) => void;
  error: string | null;
};

export function UsernameStep({ username, onUsernameChange, error }: Props) {
  return (
    <div className="text-center">
      <h1 className="text-lg font-semibold">Choose a username</h1>
      <p className="mt-2 text-sm text-foreground/50">
        This is how people will find and mention you. You can change it later in
        your profile.
      </p>

      <div className="mt-8 text-left">
        <div className="flex items-center rounded-lg border border-foreground/15 px-3 py-2.5">
          <span className="text-sm text-foreground/40">@</span>
          <input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="yourname"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 bg-transparent pl-1 text-sm outline-none"
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
