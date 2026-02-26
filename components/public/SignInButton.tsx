"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        Sign in to add yours
      </button>
    </ClerkSignInButton>
  );
}
