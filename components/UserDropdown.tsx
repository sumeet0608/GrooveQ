"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  const handleDashboard = () => {
    if (session.user.role === "SUPERADMIN") {
      router.push("/super-admin-panel");
    } else if (session.user.role === "ADMIN") {
      router.push("/admin-panel");
    } else {
      router.push("/dashboard"); // fallback
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
          <AvatarFallback>
            {session.user.name?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {session.user.name ?? "Unnamed User"}
          <br />
          <span className="text-xs">{session.user.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDashboard}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
