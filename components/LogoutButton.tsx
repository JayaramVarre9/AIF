"use client";

import { PowerIcon } from "@heroicons/react/24/outline";
import { useActionState } from "react";
import { handleSignOut } from "@/lib/cognitoActions";

export default function LogoutForm() {
  const [, dispatch] = useActionState(handleSignOut, undefined);

  return (
    <form action={dispatch}>
      <button
        className="flex h-[48px] w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-[#C51E26] transition-colors duration-200"
      >
        <PowerIcon className="w-5 h-5 text-white" />
        <span className="block">Sign Out</span>
      </button>
    </form>
  );
}
