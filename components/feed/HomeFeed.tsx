import { mockPosts } from "@/data/mockPosts";
import { PostCard } from "./PostCard";

export function HomeFeed() {
  return (
    <div className="flex flex-col">
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
