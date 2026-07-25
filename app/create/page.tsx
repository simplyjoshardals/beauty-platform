import { CreatePostForm } from "@/components/create/CreatePostForm";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CreatePostPage() {
  return (
    <RequireAuth message="Sign in to share a post.">
      <CreatePostForm />
    </RequireAuth>
  );
}
