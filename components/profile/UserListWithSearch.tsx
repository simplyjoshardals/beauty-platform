"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { UserListRow } from "./UserListRow";
import type { MockUser } from "@/data/mockUsers";

type Props = {
  users: MockUser[];
  emptyLabel: string; // shown when the list itself has nobody in it at all
};

export function UserListWithSearch({ users, emptyLabel }: Props) {
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? users.filter((u) => u.username.toLowerCase().includes(trimmed))
    : users;

  return (
    <>
      <div className="border-b border-foreground/10 px-4 py-2.5">
        <div className="flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-2">
          <MagnifyingGlassIcon size={16} className="text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </div>
      </div>

      {users.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-foreground/50">
          {emptyLabel}
        </p>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-foreground/50">
          No results for &ldquo;{query}&rdquo;
        </p>
      ) : (
        filtered.map((user) => <UserListRow key={user.username} user={user} />)
      )}
    </>
  );
}
