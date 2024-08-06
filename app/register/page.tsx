"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import googleLogo from "../../public/google.svg";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { auth } from "../firebase/config";

const Register = () => {
  const { Signup, error, message } = useAuth((state) => ({
    Signup: state.Signup,
    error: state.error,
    message: state.message,
  }));
  const [user, setUser] = useState<null | User>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      useAuth.setState({ error: "Passwords do not match." });
      return;
    }
    try {
      await Signup(email, password, confirmPassword);
      router.push("/login");
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "An unexpected error occurred. Please try again.";
      useAuth.setState({ error: errorMessage });
    }
  };

   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, (user) => {
       if (user) {
         setUser(user);
         router.push("/dashboard"); // Adjust the route as necessary
       } else {
         setUser(null);
       }
     });

     return () => unsubscribe();
   }, [router]);

   const handleGoogle = async (e: { preventDefault: () => void }) => {
     e.preventDefault();
     const provider = new GoogleAuthProvider();
     try {
       await signInWithPopup(auth, provider);
       alert("Sign in successful!");
       router.push("/dashboard");
     } catch (error) {
       console.error("Error signing in with Google:", error);
       alert("Error signing in with Google.");
     }
   };

  return (
    <div className=" w-full flex items-center justify-center h-screen">
      <div className="flex flex-col  md:max-w-1/2  items-center justify-center h-auto px-8">
        <div className="my-8">
          <h1 className=" text-[1.5rem] font-semibold">Register</h1>
        </div>
        <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="auth-btn">
            Signup
          </button>
          {error && <p className="text-danger">{error}</p>}
          {message && <p className="text-success">{message}</p>}
        </form>
        <div className="flex mt-4 gap-2 items-center text-sm w-full">
          <p>Already have an account?</p>
          <Link className="text-primary-dark hover:font-medium" href="/login">
            Login
          </Link>
        </div>
        <div className="md:my-12 my-6 before:mr-4 before:w-32 before:h-[.7px] before:bg-gray-200 after:w-32 after:h-[.7px] after:bg-gray-200 flex items-center justify-center after:ml-4 text-sm w-full">
          OR
        </div>

        <div className="gAuthBtn" onClick={handleGoogle}>
          <span>
            <Image src={googleLogo} width={24} height={24} alt="google logo" />
          </span>
          Sign up with Google
        </div>
      </div>
    </div>
  );
};

export default Register;
