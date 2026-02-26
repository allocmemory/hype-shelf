import type { Genre, Recommendation, RecommendationId } from "./recommendation";
import type { Role, UserId } from "./user";

export type RecommendationWithUser = Recommendation & {
  user: {
    _id: UserId;
    name: string;
  };
};

export type PublicRecommendation = {
  _id: RecommendationId;
  _creationTime: number;
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  isStaffPick: boolean;
  userName: string;
};

export type CurrentUser = {
  _id: UserId;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
} | null;
