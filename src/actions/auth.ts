"use server";

import { signIn, signOut, auth } from "@/auth";

export async function loginWithGoogle() {
  await signIn("google");
}

export async function logoutUser() {
  await signOut();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}