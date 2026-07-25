"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";

// For actions on PUBLIC pages (/p/[postId], /u/[username]) — the content
// itself stays visible logged out, but interacting (like, comment, save,
// follow, reply) should show a dismissible sign-in prompt instead of
// silently doing nothing or throwing. Different from RequireAuth, which
// gates a whole page rather than a single action.
export function useAuthGatedAction() {
  const { isAuthenticated } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateMessage, setGateMessage] = useState<string | undefined>(undefined);

  // Wrap any handler: runs it normally if signed in, otherwise opens the
  // gate with a message specific to THAT action, instead of one generic
  // message shared across every guarded action in the component.
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
