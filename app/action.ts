'use server'

import { auth, signIn, signOut } from "@/auth";

export const getMail = async () => {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        throw new Error("User not authenticated");
    }
    return email;
}

export async function fetchUser() {
    const session = await auth();
    return session?.user;
}
export async function logout() {
    await signOut({redirect: true})
}

export async function googleLogin() {
    await signIn("google",{callbackUrl:"/dashboard"});
}