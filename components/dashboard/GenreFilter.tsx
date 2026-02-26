"use client";

import { GENRES } from "@/types";
import type { Genre } from "@/types";

type GenreFilterProps = {
  value: Genre | undefined;
  onChange: (genre: Genre | undefined) => void;
};

export function GenreFilter({ value, onChange }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
      <button
        onClick={() => onChange(undefined)}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${
          value === undefined
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {GENRES.map((genre) => (
        <button
          key={genre}
          onClick={() => onChange(genre)}
          className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
            value === genre
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
