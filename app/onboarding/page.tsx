import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingFlow />
    </RequireAuth>
  );
}
