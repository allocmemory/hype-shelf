"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StaffPickBadge } from "./StaffPickBadge";
import type { RecommendationWithUser, CurrentUser } from "@/types";
import type { Id } from "@/convex/_generated/dataModel";

type RecCardProps = {
  recommendation: RecommendationWithUser;
  currentUser: CurrentUser;
};

export function RecCard({ recommendation, currentUser }: RecCardProps) {
  const deleteRecommendation = useMutation(api.recommendations.deleteRecommendation);
  const setStaffPick = useMutation(api.recommendations.setStaffPick);

  const isOwner = currentUser?._id === recommendation.userId;
  const isAdmin = currentUser?.role === "admin";
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recommendation?")) return;
    await deleteRecommendation({ recommendationId: recommendation._id as Id<"recommendations"> });
  };

  const handleToggleStaffPick = async () => {
    await setStaffPick({
      recommendationId: recommendation._id as Id<"recommendations">,
      isStaffPick: !recommendation.isStaffPick,
    });
  };

  return (
    <div className={`rounded-lg p-4 transition-colors bg-white ${
      recommendation.isStaffPick
        ? "border-2 border-yellow-300 bg-yellow-50"
        : "border border-gray-200 hover:border-gray-300"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {recommendation.isStaffPick && <StaffPickBadge />}
            <h3 className="font-semibold text-lg">{recommendation.title}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-2">{recommendation.blurb}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">{recommendation.genre}</span>
            <span>by {recommendation.user.name}</span>
            <a
              href={recommendation.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View link
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleToggleStaffPick}
              className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {recommendation.isStaffPick ? "Remove Pick" : "Staff Pick"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="text-sm px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
