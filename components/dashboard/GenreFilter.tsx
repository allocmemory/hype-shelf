"use client";

import { GENRES } from "@/types";
import type { Genre } from "@/types";

type GenreFilterProps = {
  value: Genre | undefined;
  onChange: (genre: Genre | undefined) => void;
};

export function GenreFilter({ value, onChange }: GenreFilterProps) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? undefined : (e.target.value as Genre))
      }
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Filter by genre"
    >
      <option value="">All genres</option>
      {GENRES.map((genre) => (
        <option key={genre} value={genre}>
          {genre.charAt(0).toUpperCase() + genre.slice(1)}
        </option>
      ))}
    </select>
  );
}
