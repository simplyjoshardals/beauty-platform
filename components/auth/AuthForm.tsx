"use client";

import { useState, type FormEvent } from "react";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthProvider";
import { CheckEmailScreen } from "./CheckEmailScreen";

// One form, no heading prop — with a magic-link flow, "log in" and "sign
// up" are the exact same action (enter email, get a link, click it).
// There's nothing that actually diverges between them here, so this
// doesn't pretend otherwise with two separate routes.
function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const { requestMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    requestMagicLink(trimmed);
    setSubmittedEmail(trimmed);
  }

  return (
    <div className="fixed left-1/2 top-0 bottom-0 z-80 flex w-full max-w-lg -translate-x-1/2 flex-col items-center justify-center bg-background px-6">
      {submittedEmail ? (
        <CheckEmailScreen
          email={submittedEmail}
          onUseDifferentEmail={() => setSubmittedEmail(null)}
          redirectTo={redirectTo}
        />
      ) : (
        <div className="w-full max-w-xs">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-foreground/5">
              <EnvelopeSimpleIcon size={26} className="text-foreground/60" />
            </div>
            <h1 className="text-lg font-semibold">Sign in to Vanity</h1>
            <p className="text-sm text-foreground/50">
              We&rsquo;ll email you a link to sign in. No password to remember,
              and no separate signup, whether you&rsquo;re new here or coming
              back.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="w-full rounded-lg border border-foreground/15 bg-transparent px-3 py-2.5 text-sm outline-none"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background"
            >
              Continue
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
