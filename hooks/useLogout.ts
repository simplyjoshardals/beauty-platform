"use client";

import { useMutation } from "@tanstack/react-query";
import { logOutUser } from "@/services/authService";

// A hard redirect (not router.push) is deliberate — logout is the one
// moment a fully fresh page load, with no leftover React Query cache or
// component state from the previous session, is actually what you
// want. The server's already cleared the session cookies by the time
// onSuccess fires; this makes sure nothing client-side survives into
// whatever session gets signed in next on this browser.
export function useLogout() {
  return useMutation({
    mutationFn: () => logOutUser(),
  });
}
