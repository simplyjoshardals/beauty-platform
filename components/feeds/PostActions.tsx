import {
  HeartIcon,
  ChatCircleIcon,
  PaperPlaneTiltIcon,
  BookmarkSimpleIcon,
} from "@phosphor-icons/react";

type Props = {
  liked: boolean;
  saved: boolean;
  likeCount: number;
  commentCount: number;
  onToggleLike: () => void;
  onToggleSave: () => void;
};

// Controlled by the parent PostCard so the double-tap-to-like gesture on the
// media and this row stay in sync — both drive the same state.
export function PostActions({
  liked,
  saved,
  likeCount,
  commentCount,
  onToggleLike,
  onToggleSave,
}: Props) {
  return (
    <div className="flex items-center gap-4 px-3 py-2">
      <button
        type="button"
        onClick={onToggleLike}
        aria-label={liked ? "Unlike" : "Like"}
        className="flex items-center gap-1.5 transition-transform active:scale-90"
      >
        <HeartIcon
          size={24}
          weight={liked ? "fill" : "regular"}
          className={liked ? "text-red-500" : "text-foreground"}
        />
        <span className="text-sm text-foreground/70">{likeCount}</span>
      </button>

      <button
        type="button"
        aria-label="Comment"
        className="flex items-center gap-1.5 transition-transform active:scale-90"
      >
        <ChatCircleIcon size={24} className="text-foreground" />
        <span className="text-sm text-foreground/70">{commentCount}</span>
      </button>

      <button
        type="button"
        aria-label="Share"
        className="transition-transform active:scale-90"
      >
        <PaperPlaneTiltIcon size={24} className="text-foreground" />
      </button>

      <button
        type="button"
        onClick={onToggleSave}
        aria-label={saved ? "Remove from saved" : "Save"}
        className="ml-auto transition-transform active:scale-90"
      >
        <BookmarkSimpleIcon
          size={24}
          weight={saved ? "fill" : "regular"}
          className="text-foreground"
        />
      </button>
    </div>
  );
}
