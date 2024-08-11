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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import authImg from "../../../public/heroImg.png";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "@/utils/validationSchema";
import { z } from "zod";
import { auth } from "@/app/firebase/config";
import { getErrorMessage } from "@/utils/errorHandler";

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const { Signin, error, message } = useAuth((state) => ({
    Signin: state.Signin,
    error: state.error,
    message: state.message,
  }));
  const [user, setUser] = useState<null | User>(null);
  const router = useRouter();

  const methods = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const handleGoogle = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Sign in successful!");
      router.push("/user");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert("Error signing in with Google.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push("/user");
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await Signin(data.email, data.password, "");
      router.push("/user");
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error("Sign in failed:", errorMessage);
      alert("Sign in failed: " + errorMessage);
    }
  };

  return (
    <>
      <div className="w-full flex md:flex-row flex-col items-center justify-center h-screen px-4  md:gap-1">
        <div className="hidden md:flex flex-col md:w-1/2 items-center justify-center h-auto px-8 ">
          <Image src={authImg} alt="hospital vehicle" />
        </div>

        <div className="flex flex-col md:w-1/3 w-full items-center justify-center h-auto px-8 border rounded-lg  py-8 ">
          <div className="mb-4">
            <h1 className="text-[1.5rem] font-semibold">Login</h1>
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
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>{errors.password?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="auth-btn"
                disabled={isSubmitting}
              >
                Sign in
              </Button>
              {error && <p className="text-danger">{error}</p>}
              {message && <p className="text-success">{message}</p>}
            </form>
          </FormProvider>
          <div className="flex mt-2 gap-2 items-center text-sm w-full">
            <p>Don&apos;t have an account?</p>
            <Link
              href="/user/register"
              className="text-primary-dark hover:font-medium"
            >
              Register
            </Link>
          </div>
          <div className="md:my-8 my-6 before:mr-4 before:w-24 before:h-[0.5px] before:bg-gray-200 after:w-24 after:h-[0.5px] after:bg-gray-200 flex items-center justify-center after:ml-4 text-xs w-full">
            OR
          </div>
          <Button className="flex gap-3 w-full" onClick={handleGoogle}>
            <span>
              <Image
                src={googleLogo}
                width={16}
                height={16}
                alt="google logo"
              />
            </span>
            Sign in with Google
          </Button>
        </div>
      </div>
    </>
  );
};

export default Login;