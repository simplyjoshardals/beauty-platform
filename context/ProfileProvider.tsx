"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProductTag } from "@/types/post";
import { CURRENT_USER_ID } from "@/constants/currentUser";
import { CURRENT_USER_PROFILE } from "@/data/currentUserProfile";

export type EditableProfile = {
  id: string; // stable, never edited — see CURRENT_USER_ID
  username: string; // now genuinely editable, unlike the old hardcoded "you"
  avatarSrc: string;
  bio: string;
  toneTag: string;
  pinnedRoutine: ProductTag[];
};

type ProfileContextValue = {
  profile: EditableProfile;
  updateProfile: (updates: Partial<EditableProfile>) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

// In-memory only, same caveat as posts/follow state — resets on refresh.
// Seeded with a placeholder-looking username on purpose: onboarding's
// first step now forces picking a real one before anything else, the
// same way a real app wouldn't let you post as "user482910."
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<EditableProfile>({
    id: CURRENT_USER_ID,
    username: "newuser",
    avatarSrc: "/mock/avatar-you.jpg",
    bio: CURRENT_USER_PROFILE.bio,
    toneTag: CURRENT_USER_PROFILE.toneTag,
    pinnedRoutine: CURRENT_USER_PROFILE.pinnedRoutine,
  });

  function updateProfile(updates: Partial<EditableProfile>) {
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
