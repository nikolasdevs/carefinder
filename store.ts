"use client";

import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  confirmPasswordReset,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/app/firebase/config";

export type Profile = {
  email: string;
  password: string;
  isLogin: boolean;
  isRegister: boolean;
  isForgot: boolean;
  isReset: boolean;
  isChange: boolean;
  isChangePassword: boolean;
  isChangeEmail: boolean;
  isChangePhone: boolean;
  isChangeAddress: boolean;
  isChangeAvatar: boolean;
};

export type Auth = {
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  message: string;
};

export type Actions = {
  Signup: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  Signin: (email: string, password: string, router: any) => Promise<void>;
  forgot: (email: string) => Promise<void>;
  reset: (
    code: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  update: (email: string, password: string, confirmPassword: string) => void;
  changePassword: (password: string, confirmPassword: string) => Promise<void>;
  changeEmail: (email: string) => Promise<void>;
};

export type Status = "successful" | "pending" | "failed";

export const useAuth = create<Auth & Actions>((set) => ({
  email: "",
  password: "",
  confirmPassword: "",
  error: "",
  message: "",

  Signup: async (email: string, password: string, confirmPassword: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await sendEmailVerification(user);

      // Temporarily store user data in local storage
      localStorage.setItem(
        "regData",
        JSON.stringify({
          email,
          password,
          confirmPassword,
        })
      );

      // Clear form fields and set success message
      set({
        email: "",
        password: "",
        confirmPassword: "",
        message: "Signup successful. Please verify your email.",
        error: "",
      });
    } catch (e) {
      if (e instanceof Error) {
        let errorMessage =
          "An unexpected error occurred. Please try again later.";

        switch (e.message) {
          case "Firebase: Error (auth/network-request-failed).":
            errorMessage =
              "Network error. Please check your internet connection.";
            break;
          case "Firebase: Error (auth/email-already-in-use).":
            errorMessage = "Email already in use. Please try logging in.";
            break;
          case "Firebase: Error (auth/invalid-email).":
            errorMessage = "Invalid email address. Please enter a valid email.";
            break;
          case "Firebase: Error (auth/weak-password).":
            errorMessage = "Weak password. Please enter a stronger password.";
            break;
          default:
            break;
        }
        set({ error: errorMessage, message: "" });
      } else {
        set({ error: "Unknown error", message: "" });
      }
    }
  },

  Signin: async (email: string, password: string, router: any) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        // Retrieve user data from local storage
        const regData = localStorage.getItem("regData");
        const { email = "" } = regData ? JSON.parse(regData) : {};

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists) {
          // Save user to Firestore after verification
          await setDoc(doc(firestore, "users", user.uid), {
            email: user.email,
          });
        }
        router.push("/");
      } else {
        set({
          error: "Please verify your email before logging in.",
          message: "",
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        set({ error: e.message, message: "" });
      } else {
        set({ error: "Unknown error", message: "" });
      }
    }
  },

  forgot: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      set({
        message: "Password reset email sent. Check your inbox.",
        error: "",
      });
    } catch (e) {
      if (e instanceof Error) {
        set({ error: e.message, message: "" });
      } else {
        set({ error: "Unknown error", message: "" });
      }
    }
  },

  reset: async (code: string, password: string, confirmPassword: string) => {
    try {
      await confirmPasswordReset(auth, code, password);
      set({
        message: "Password has been reset successfully. You can now log in.",
        error: "",
      });
    } catch (e) {
      if (e instanceof Error) {
        set({ error: e.message, message: "" });
      } else {
        set({ error: "Unknown error", message: "" });
      }
    }
  },

  update: (email: string, password: string, confirmPassword: string) => {},

  changePassword: async (password: string, confirmPassword: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, password);
        set({ message: "Password updated successfully.", error: "" });
      }
    } catch (e) {
      if (e instanceof Error) {
        set({ error: e.message, message: "" });
      } else {
        set({ error: "Unknown error", message: "" });
      }
    }
  },

  changeEmail: async (email: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateEmail(user, email);
        set({ message: "Email updated successfully.", error: "" });
      }
    } catch (e) {
      if (e instanceof Error) {
        set({ error: e.message, message: "" });
      } else {
        set({ error: "Unknown error", message: "" });
      }
    }
  },
}));
