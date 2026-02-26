export type Role = "admin" | "user";

export type UserId = string & { __tableName: "users" };

export type User = {
  _id: UserId;
  _creationTime: number;
  clerkId: string;
  email: string;
  name: string;
  role: Role;
};
