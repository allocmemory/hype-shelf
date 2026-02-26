"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GenreFilter } from "./GenreFilter";
import { RecCard } from "./RecCard";
import type { Genre, CurrentUser } from "@/types";

type RecListProps = {
  currentUser: CurrentUser;
};

export function RecList({ currentUser }: RecListProps) {
  const [genre, setGenre] = useState<Genre | undefined>(undefined);
  const recommendations = useQuery(api.recommendations.getAllRecommendations, { genre });

  if (recommendations === undefined) {
    return <div className="text-gray-500 text-center py-8">Loading recommendations...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">All Recommendations</h2>
        <GenreFilter value={genre} onChange={setGenre} />
      </div>
      {recommendations.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {genre ? `No ${genre} recommendations yet.` : "No recommendations yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecCard key={rec._id} recommendation={rec} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}
