import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function EditProfilePage() {
  return (
    <RequireAuth>
      <EditProfileForm />
    </RequireAuth>
  );
}
