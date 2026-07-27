import { CreatePostForm } from "@/components/create/CreatePostForm";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CreatePostPage() {
  return (
    <RequireAuth>
      <CreatePostForm />
    </RequireAuth>
  );
}
