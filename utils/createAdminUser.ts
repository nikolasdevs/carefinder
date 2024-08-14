"use client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/app/firebase/config";
import { setDoc, doc } from "firebase/firestore";
import { getErrorMessage } from "./errorHandler";
import { z } from "zod";

const adminUserSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

const createAdminUser = async (data: z.infer<typeof adminUserSchema>) => {
  try {
    const result = adminUserSchema.parse(data);
    const { email, password } = result;
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!user) {
      throw new Error("Failed to create user");
    }

    const userDocRef = doc(firestore, "admin", user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      role: "admin",
      createdAt: new Date(),
    });

    console.log(`Admin user created successfully: ${email}`);
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error(e.issues);
      alert(e.issues[0].message);
    } else {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      alert(errorMessage);
    }
  }
};

export default createAdminUser;
