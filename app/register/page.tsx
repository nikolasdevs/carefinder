"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import googleLogo from "../../public/google.svg";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";

const Register = () => {
  const { Signup, error, message } = useAuth((state) => ({
    Signup: state.Signup,
    error: state.error,
    message: state.message,
  }));
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

  return (
    <div>
      <div className="auth_container">
        <div className="header">
          <h1>Register</h1>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            <button type="submit">Signup</button>
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}
          </form>
          <div className="flex">
            <p>Already have an account?</p>
            <Link href="/login">Login</Link>
          </div>
          <div className="md:my-12 my-6 before:mr-4 before:w-32 before:h-[1px] before:bg-gray-100 after:w-32 after:h-[1px] after:bg-gray-100 flex items-center justify-center after:ml-4">
            OR
          </div>
          <div>
            <Link
              className="rounded-full btn border flex gap-8 items-center justify-center gAuthBtn"
              href={"/register/googlesignup"}
            >
              <span>
                <Image
                  src={googleLogo}
                  width={24}
                  height={24}
                  alt="google logo"
                />
              </span>
              Sign up with Google
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
