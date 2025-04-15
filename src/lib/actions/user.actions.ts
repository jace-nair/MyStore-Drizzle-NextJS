"use server";

import { signInFormSchema, signUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { db } from "@/db";
import { user } from "@/db/schema";
import { formatError } from "../utils";

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

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    // Get the user data from the sign up form
    const formUser = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    // Get the plain password
    const plainPassword = formUser.password;

    // Hash the user password
    formUser.password = hashSync(formUser.password, 10);

    // Create the user and save it in database
    await db.insert(user).values({
      name: formUser.name,
      email: formUser.email,
      password: formUser.password,
    });

    // Sign in the user automatically
    await signIn("credentials", {
      email: formUser.email,
      password: plainPassword,
    });

    // Return an success object with a message
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    /*console.log(error.name);
    console.log(error.code);
    console.log(error.errors);
    console.log(error.meta?.target);*/
    // If something goes wrong
    // Check if it's a redirect error
    if (isRedirectError(error)) {
      throw error;
    }

    // Return an object with success and message
    return { success: false, message: formatError(error) };
  }
}
