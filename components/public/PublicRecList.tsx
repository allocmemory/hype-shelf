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
      <div className="text-gray-400 text-center py-12">
        No recommendations yet. Sign in to be the first!
      </div>
    );
  }

  const staffPick = (recommendations as PublicRecommendation[]).find(r => r.isStaffPick);
  const otherRecs = (recommendations as PublicRecommendation[]).filter(r => !r.isStaffPick);

  return (
    <div className="space-y-4">
      {staffPick && (
        <div
          className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">
              Staff Pick
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-1">{staffPick.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{staffPick.blurb}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">{staffPick.genre}</span>
            <span>by {staffPick.userName}</span>
            <a
              href={staffPick.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View link
            </a>
          </div>
        </div>
      )}
      {otherRecs.map((rec) => (
        <div
          key={String(rec._id)}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
        >
          <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{rec.blurb}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">{rec.genre}</span>
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
      ))}
    </div>
  );
}
