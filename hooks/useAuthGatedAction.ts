"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// For actions on PUBLIC pages (/p/[postId], /u/[username]) — the content
// itself stays visible logged out, but interacting (like, comment, save,
// follow, reply) should show a dismissible sign-in prompt instead of
// silently doing nothing or throwing. Different from RequireAuth, which
// gates a whole page rather than a single action.
export function useAuthGatedAction() {
  const { isAuthenticated } = useCurrentUser();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateMessage, setGateMessage] = useState<string | undefined>(undefined);

  // Wrap any handler: runs it normally if signed in, otherwise opens the
  // gate with a message specific to THAT action, instead of one generic
  // message shared across every guarded action in the component. Doesn't
  // special-case the brief loading window before the session check
  // resolves (unlike RequireAuth) — the realistic odds of someone tapping
  // a like/follow button in that sub-second gap are low enough that it
  // wasn't worth the extra state here.
  function guard<Args extends unknown[]>(
    fn: (...args: Args) => void,
    message?: string,
  ) {
    return (...args: Args) => {
      if (!isAuthenticated) {
        setGateMessage(message);
        setGateOpen(true);
        return;
      }
      fn(...args);
    };
  }

  return {
    gateOpen,
    gateMessage,
    closeGate: () => setGateOpen(false),
    guard,
  };
}
