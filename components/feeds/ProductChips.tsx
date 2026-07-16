import type { ProductTag } from "@/types/post";

export function ProductChips({ products }: { products: ProductTag[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
      {products.map((p) => (
        <span
          key={p.id}
          className="shrink-0 whitespace-nowrap rounded-full border border-foreground/15 px-3 py-1 text-xs"
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}
