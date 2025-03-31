"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-3xl font-semibold mb-6">Welcome to GrooveQ</h1>

      {!session ? (
        <Button onClick={() => signIn("google")} className="mb-4">
          Sign in with Google
        </Button>
      ) : (
        <>
          <p className="mb-2">Logged in as {session.user?.email}</p>
          <Button onClick={() => router.push("/register-admin")}>
            Continue as Admin
          </Button>
        </>
      )}
    </div>
  );
}
