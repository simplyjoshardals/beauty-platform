"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { checkUsernameAvailability } from "@/services/userService";
import { USERNAME_PATTERN } from "@/constants/username";

const DEBOUNCE_MS = 450;

export type UsernameCheckStatus =
  | "idle" // nothing to check yet — empty, too short, invalid format, or unchanged
  | "checking"
  | "available"
  | "taken"
  | "error";

// Live-checks a username against the real backend as someone types,
// debounced so it's not firing a request on every keystroke. Format
// validation happens locally first (free, instant) — the network call
// only ever fires for something that's already shaped like a valid
// username. `currentUsername`, if provided, means "and don't check at
// all if this exactly matches what they already have" — used so keeping
// your own existing username unchanged never gets flagged as taken.
export function useUsernameAvailability(
  rawUsername: string,
  currentUsername?: string,
) {
  const debounced = useDebouncedValue(
    rawUsername.trim().toLowerCase(),
    DEBOUNCE_MS,
  );

  const isFormatValid = USERNAME_PATTERN.test(debounced);
  const isUnchanged =
    Boolean(currentUsername) && debounced === currentUsername?.toLowerCase();
  const shouldCheck = isFormatValid && !isUnchanged;

  const query = useQuery({
    queryKey: ["usernameAvailability", debounced],
    queryFn: () => checkUsernameAvailability(debounced),
    enabled: shouldCheck,
    staleTime: 0, // every keystroke is effectively a new question
    retry: 0,
  });

  let status: UsernameCheckStatus = "idle";
  if (shouldCheck) {
    if (query.isFetching) status = "checking";
    else if (query.isError) status = "error";
    else if (query.data?.available === true) status = "available";
    else if (query.data?.available === false) status = "taken";
  }

  return { status };
}
