"use client";

import { useState, type KeyboardEvent } from "react";
import { XIcon, PlusIcon } from "@phosphor-icons/react";
import type { ProductTag } from "@/types/post";

type Props = {
  label: string;
  placeholder: string;
  products: ProductTag[];
  onChange: (products: ProductTag[]) => void;
};

// Shared between the create-post product-tagging step and the edit-profile
// pinned routine editor — same "type a label, add a chip, remove a chip"
// interaction in both places, so it shouldn't exist as two copies that can
// drift apart in behavior.
export function ProductTagEditor({
  label,
  placeholder,
  products,
  onChange,
}: Props) {
  const [draft, setDraft] = useState("");

  function addProduct() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...products, { id: crypto.randomUUID(), label: trimmed }]);
    setDraft("");
  }

  function removeProduct(id: string) {
    onChange(products.filter((p) => p.id !== id));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addProduct();
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={addProduct}
          disabled={!draft.trim()}
          aria-label="Add"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 disabled:opacity-30"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      {products.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {products.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 rounded-full border border-foreground/15 px-3 py-1 text-xs"
            >
              {p.label}
              <button
                type="button"
                onClick={() => removeProduct(p.id)}
                aria-label={`Remove ${p.label}`}
              >
                <XIcon size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
