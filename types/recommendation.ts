import type { UserId } from "./user";

export type Genre = "horror" | "action" | "comedy" | "drama" | "sci-fi" | "other";

export const GENRES: Genre[] = ["horror", "action", "comedy", "drama", "sci-fi", "other"];

export type RecommendationId = string & { __tableName: "recommendations" };

export type Recommendation = {
  _id: RecommendationId;
  _creationTime: number;
  userId: UserId;
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  isStaffPick: boolean;
};
