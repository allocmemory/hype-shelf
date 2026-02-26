import { PublicRecList } from "@/components/public/PublicRecList";
import { SignInButton } from "@/components/public/SignInButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HypeShelf</h1>
          <p className="text-xl text-gray-600 mb-8">
            Collect and share the stuff you&apos;re hyped about.
          </p>
          <SignInButton />
        </header>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Latest Recommendations
          </h2>
          <PublicRecList />
        </section>
      </div>
    </main>
  );
}
