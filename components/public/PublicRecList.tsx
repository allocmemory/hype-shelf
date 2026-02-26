"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PublicRecommendation } from "@/types";

export function PublicRecList() {
  const recommendations = useQuery(api.recommendations.getPublicRecommendations);

  if (recommendations === undefined) {
    return (
      <div className="text-gray-500 text-center py-8">
        Loading recommendations...
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No recommendations yet. Be the first to share!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec: PublicRecommendation) => (
        <div
          key={String(rec._id)}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{rec.title}</h3>
                {rec.isStaffPick && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                    Staff Pick
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{rec.blurb}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="capitalize">{rec.genre}</span>
                <span>by {rec.userName}</span>
                <a
                  href={rec.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View link
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
