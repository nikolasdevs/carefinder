"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import googleLogo from "../../../public/google.svg";
import { useAuth } from "@/store";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from "firebase/auth";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema } from "@/utils/validationSchema";
import { z } from "zod";
import authImg from "../../../public/heroImg.png";
import { auth } from "@/app/firebase/config";

type RegisterFormInputs = z.infer<typeof registerSchema>;

const Register = () => {
  const { Signup, error, message } = useAuth((state) => ({
    Signup: state.Signup,
    error: state.error,
    message: state.message,
  }));
  const [user, setUser] = useState<null | User>(null);
  const router = useRouter();

  const methods = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: RegisterFormInputs) => {
    if (data.password !== data.confirmPassword) {
      useAuth.setState({ error: "Passwords do not match." });
      return;
    }
    try {
      await Signup(data.email, data.password, data.confirmPassword);
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
    <div className="w-full flex md:flex-row flex-col items-center justify-center h-screen  md:gap-1">
      <div className="hidden md:flex flex-col md:w-1/3 items-center justify-center h-auto px-8 ">
        <Image src={authImg} alt="hospital vehicle " />
      </div>
      <div className="flex flex-col md:max-w-1/2 items-center justify-center h-auto px-8 border rounded-lg  py-8">
        <div className="mb-4  ">
          <h1 className="text-[1.5rem] font-semibold">Register</h1>
        </div>
        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormField
              control={methods.control}
              name="email"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage>{errors.email?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="password"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>

                  <FormMessage>{errors.password?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="confirmPassword"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage>{errors.confirmPassword?.message}</FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" className="auth-btn" disabled={isSubmitting}>
              Sign up
            </Button>
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}
          </form>
        </FormProvider>
        <div className="flex mt-2 gap-2 items-center text-sm w-full">
          <p>Already have an account?</p>
          <Link
            href="/user/login"
            className="text-primary-dark hover:font-medium"
          >
            Login
          </Link>
        </div>
        <div className="md:my-8 my-6 before:mr-4 before:w-32 before:h-[.7px] before:bg-gray-200 after:w-32 after:h-[.7px] after:bg-gray-200 flex items-center justify-center after:ml-4 text-sm w-full">
          Or continue with
        </div>
        <Button className="flex gap-3 w-full" onClick={handleGoogle}>
          <span>
            <Image src={googleLogo} width={16} height={16} alt="google logo" />
          </span>
          Sign up with Google
        </Button>
      </div>
    </div>
  );
};

export default Register;
