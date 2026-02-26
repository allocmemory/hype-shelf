"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddRecForm } from "@/components/dashboard/AddRecForm";
import { RecList } from "@/components/dashboard/RecList";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (isLoaded && user) {
      getOrCreateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "Anonymous",
      });
    }
  }, [isLoaded, user, getOrCreateUser]);

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-gray-500 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddRecForm />
        </div>
        <div className="lg:col-span-2">
          <RecList currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
