# HypeShelf

Collect and share the stuff you're hyped about.

## Architecture Overview

HypeShelf is a full-stack web application built with:

- **Frontend**: Next.js 15 (App Router) with TypeScript and Tailwind CSS
- **Authentication**: Clerk for user authentication
- **Backend/Database**: Convex for serverless functions and database

### Directory Structure

```
/app
  layout.tsx                  # ClerkProvider wrapper
  page.tsx                    # Public landing page
  /dashboard
    layout.tsx                # Auth guard, redirects if not signed in
    page.tsx                  # Authenticated rec list + add form
/components
  /public
    PublicRecList.tsx         # Read-only list for unauthenticated users
    SignInButton.tsx          # Clerk sign-in modal trigger
  /dashboard
    RecList.tsx               # Full rec list with filtering
    RecCard.tsx               # Individual recommendation card
    AddRecForm.tsx            # Form to add new recommendation
    GenreFilter.tsx           # Genre dropdown filter
    StaffPickBadge.tsx        # Visual badge for staff picks
/convex
  schema.ts                   # Database schema (users, recommendations)
  auth.ts                     # Shared auth helper functions
  users.ts                    # User queries and mutations
  recommendations.ts          # Recommendation queries and mutations
/types
  user.ts                     # User and Role types
  recommendation.ts           # Recommendation and Genre types
  api.ts                      # API response shapes
/lib
  convex.tsx                  # ConvexProvider with Clerk integration
```

## Security Decisions

All authorization logic is enforced server-side in Convex mutations and queries. The security model follows a strict three-step pattern for every authenticated operation:

1. **Authentication check**: Call `ctx.auth.getUserIdentity()` and throw `ConvexError("Unauthenticated")` if null
2. **User lookup**: Load the user from the database by their Clerk ID and throw `ConvexError("User not found")` if missing
3. **Role check**: Verify the user has the required role from the database record

Key security principles:
- Role is always read from the Convex `users` table, never from Clerk metadata or client state
- Client UI conditionally renders admin features based on role fetched from Convex query
- The `isStaffPick` field can only be set to `true` by admin users
- Only one recommendation can be a staff pick at a time (enforced server-side)
- Users can only delete their own recommendations; admins can delete any
- User-submitted links are rendered with `rel="noopener noreferrer" target="_blank"`

## How to Run Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your credentials:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_KEY
   NEXT_PUBLIC_CONVEX_URL=https://YOUR_PROJECT.convex.cloud
   CONVEX_DEPLOY_KEY=YOUR_DEPLOY_KEY
   ```

3. Set up Clerk:
   - Create a Clerk application at https://dashboard.clerk.com
   - Copy your API keys to `.env.local`

4. Set up Convex:
   - Create a Convex project at https://dashboard.convex.dev
   - Run `npx convex dev` to start the Convex development server
   - Copy your project URL to `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

## How to Set Admin Role in Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your HypeShelf project
3. Navigate to the "Data" tab
4. Click on the `users` table
5. Find the user you want to make admin
6. Click on their row to edit
7. Change the `role` field from `"user"` to `"admin"`
8. Save the change

Note: There is no self-promotion path. Admin role can only be granted by manually editing the database.

## Running Tests

```bash
npm test
```

## Deployment

- **Frontend**: Deploy to Vercel by connecting your repository
- **Backend**: Convex deploys automatically when you run `npx convex deploy`
