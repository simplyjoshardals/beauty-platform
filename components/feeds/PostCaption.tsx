"use client";

import { useState } from "react";

export function PostCaption({
  username,
  text,
}: {
  username: string;
  text: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 90;

  return (
    <p className="px-3 pb-3 text-sm leading-snug">
      <span className="font-medium">{username}</span>{" "}
      {expanded || !isLong ? text : `${text.slice(0, 90)}…`}{" "}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-foreground/50"
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </p>
  );
}
