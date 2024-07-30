"use client";

import { setDoc, doc } from "firebase/firestore";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/app/firebase/config";

const createAdminUser = async (email: string, password: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userDoc = doc(firestore, "users", user.uid);
    await setDoc(userDoc, {
      email: user.email,
      role: "admin",
    });
    console.log(`Admin user created successfully: ${email}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};
export default createAdminUser;
