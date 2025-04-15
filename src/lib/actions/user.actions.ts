"use server";

import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Get the Sign in form data and parse it with signInFormSchema
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Pass the user credentials to signIn function from auth.ts
    await signIn("credentials", user);

    // Return an object with success and message
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    // If something goes wrong
    // Check if it's a redirect error
    if (isRedirectError(error)) {
      throw error;
    }

    // Return an object with success and message
    return { success: false, message: "Invalid email or password" };
  }
}

// Sign user out. Deletes cookie.
export async function signOutUser() {
  await signOut();
}
