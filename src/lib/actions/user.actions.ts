"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateUserSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { db } from "@/db";
import { user } from "@/db/schema";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { eq, desc, count, and, ilike } from "drizzle-orm";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
//import { revalidatePath } from "next/cache";

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

// Get user by the ID
export async function getUserById(userId: string) {
  const dbUser = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  });
  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

// Update the user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const currentUser = await db.query.user.findFirst({
      /* eslint-disable  @typescript-eslint/no-non-null-asserted-optional-chain */
      where: (user, { eq }) => eq(user.id, session?.user?.id!),
    });
    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);
    await db.update(user).set({ address }).where(eq(user.id, currentUser.id));
    //revalidatePath("/place-order");
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, session?.user?.id!),
    });
    if (!currentUser) throw new Error("User not found");
    const paymentMethod = paymentMethodSchema.parse(data);
    await db
      .update(user)
      .set({ paymentMethod: paymentMethod.type })
      .where(eq(user.id, currentUser.id));
    //revalidatePath("/place-order");
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Update the user profile
export async function updateProfile(userObject: {
  name: string;
  email: string;
}) {
  try {
    const session = await auth();
    const currentUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, session?.user?.id!),
    });
    if (!currentUser) throw new Error("User not found");
    await db
      .update(user)
      .set({
        name: userObject.name,
      })
      .where(eq(user.id, currentUser.id));

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/*
// Get all users - Old
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });
  const dataCount = await db.select({ count: count() }).from(user);
  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}
*/

// Get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter =
    query && query !== "all" ? ilike(user.name, `%${query}%`) : undefined;

  const data = await db
    .select()
    .from(user)
    //.leftJoin(user, eq(order.userId, user.id))
    .where(queryFilter ? and(queryFilter) : undefined)
    .orderBy(desc(user.createdAt))
    .offset((page - 1) * limit)
    .limit(limit);

  const dataCount = await db
    .select({ count: count() })
    .from(user)
    //.leftJoin(user, eq(order.userId, user.id))
    .where(queryFilter ? and(queryFilter) : undefined);

  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await db.delete(user).where(eq(user.id, id));
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a user
export async function updateUser(
  userToUpdate: z.infer<typeof updateUserSchema>
) {
  try {
    await db
      .update(user)
      .set({
        name: userToUpdate.name,
        role: userToUpdate.role,
      })
      .where(eq(user.id, userToUpdate.id));
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
