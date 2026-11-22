"use client";

import Image from "next/image";
import { useState } from "react";
import { getIngredientImageUrl } from "@/lib/mealdb";

export function IngredientThumb({ name }: { name: string }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-sm font-bold text-text"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="relative block size-11 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
      <Image
        src={getIngredientImageUrl(name, "small")}
        alt=""
        fill
        sizes="44px"
        className="object-contain p-1"
        onError={() => setHidden(true)}
      />
    </span>
  );
}
