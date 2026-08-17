"use client";

import {
  CheckCircleIcon,
  XCircleIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import type { UsernameCheckStatus } from "@/hooks/useUsernameAvailability";

type Props = {
  username: string;
  onUsernameChange: (value: string) => void;
  error: string | null;
  checkStatus?: UsernameCheckStatus;
};

export function UsernameStep({
  username,
  onUsernameChange,
  error,
  checkStatus = "idle",
}: Props) {
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
          {checkStatus === "checking" && (
            <SpinnerGapIcon
              size={16}
              className="animate-spin text-foreground/40"
            />
          )}
          {checkStatus === "available" && (
            <CheckCircleIcon
              size={16}
              weight="fill"
              className="text-green-500"
            />
          )}
          {checkStatus === "taken" && (
            <XCircleIcon size={16} weight="fill" className="text-red-500" />
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        ) : checkStatus === "taken" ? (
          <p className="mt-1.5 text-xs text-red-500">
            That username is already taken.
          </p>
        ) : checkStatus === "available" ? (
          <p className="mt-1.5 text-xs text-green-600">Username available</p>
        ) : null}
      </div>
    </div>
  );
}
