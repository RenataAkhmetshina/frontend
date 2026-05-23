"use client";

import Link from "next/link";
import { getToken, logout } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const isAuth = typeof window !== "undefined" && getToken();

  return (
    <div className="flex justify-between p-4 border-b">

      <Link href="/" className="font-bold text-lg">
        Flashcard Learning App
      </Link>

      <div className="flex gap-4">
        {isAuth ? (
          <>
            <button
              onClick={() => {
                logout();
                router.push("/signin");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/signin">Sign In</Link>
        )}
      </div>

    </div>
  );
}