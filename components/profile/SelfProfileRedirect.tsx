"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PATHS } from "@/utils/paths";

type Props = {
  username: string;
  children: ReactNode;
};

// This route is for viewing OTHER people. Your own profile — with Edit
// Profile instead of a Follow button — lives at /profile. Redirect
// rather than rendering a nonsensical "follow yourself" state.
// Compared against your LIVE username (not a frozen constant) — since
// username is now editable, visiting /u/your-new-handle needs to still
// correctly recognize it's you, right after a rename.
//
// currentUser is already hydrated globally (see app/layout.tsx), so
// this resolves synchronously on first render rather than adding its
// own loading gap — it wraps the header/grid tree without holding up
// either one's streaming.
export function SelfProfileRedirect({ username, children }: Props) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const isSelf = username === currentUser?.username;

  useEffect(() => {
    if (isSelf) {
      router.replace(PATHS.PROFILE);
    }
  }, [isSelf, router]);

  if (isSelf) {
    return null;
  }

  return <>{children}</>;
}
