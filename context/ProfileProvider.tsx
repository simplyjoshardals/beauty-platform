"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProductTag } from "@/types/post";
import { CURRENT_USER } from "@/constants/currentUser";
import { CURRENT_USER_PROFILE } from "@/data/currentUserProfile";

export type EditableProfile = {
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
// Deliberately does NOT include username: it currently doubles as the
// stable identity key used for ownership checks (isOwnPost) and follow
// lookups throughout the app. Making it editable safely needs a real
// user-id system first, so it stays fixed on CURRENT_USER for now.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<EditableProfile>({
    avatarSrc: CURRENT_USER.avatarSrc,
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
