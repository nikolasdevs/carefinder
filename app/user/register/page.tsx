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
import { auth } from "@/app/firebase/config";
import Logo from "../../../public/logo.png";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/theme-toggle";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { Label } from "@/components/ui/label";

type RegisterFormInputs = z.infer<typeof registerSchema>;

const Register = () => {
  const { Signup, error, message } = useAuth((state: any) => ({
    Signup: state.Signup,
    error: state.error,
    message: state.message,
  }));
  const [user, setUser] = useState<null | User>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const methods = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: RegisterFormInputs) => {
    if (data.password !== data.confirmPassword) {
      useAuth.setState({ error: "Passwords do not match." });
      return;
    }
    try {
      await Signup(data.email, data.password, data.confirmPassword);
      router.push("/user");
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "An unexpected error occurred. Please try again.";
      useAuth.setState({ error: errorMessage });
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push("/ "); // Adjust the route as necessary
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
    <>
      <div className="flex flex-col w-full h-screen md:p-10 p-5">
        <div className=" flex justify-between items-center">
          <Link href="/" className=" w-32">
            <Image src={Logo} alt="hero" />
          </Link>
          <ModeToggle />
        </div>
        <div className="w-full flex md:flex-row flex-col items-center justify-center h-screen px-4  md:gap-10">
          <div className="hidden md:flex  flex-col md:w-1/2 items-center justify-center ">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1,
                ease: "easeInOut",
              }}
            >
              <div className="gap-3 flex flex-col  items-center justify-center text-center h-80  w-80 leading-normal">
                <h2 className=" font-semibold">Welcome to Carefinder!</h2>
                <p className=" flex flex-col gap-3 items-center justify-center">
                  Join us in our mission to enhance healthcare accessibility for
                  everyone. Together, we can make a difference in countless
                  lives.
                  <span className=" w-24 h-[2px] bg-primary "></span>
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col md:w-1/2 w-full  items-center justify-center h-auto">
            <div className="md:w-4/6 w-full  border rounded-lg p-8 ">
              <div className="mb-8">
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
                          <Label className="relative flex items-center">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              {...field}
                            />
                            <span
                              className="absolute right-3 text-gray-400"
                              onClick={handleShowPassword}
                            >
                              {showPassword ? <Eye /> : <EyeSlash />}
                            </span>
                          </Label>
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

                        <FormMessage>
                          {errors.confirmPassword?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="auth-btn"
                    disabled={isSubmitting}
                  >
                    Sign up
                  </Button>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
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
              <div className="md:my-8 my-6 before:mr-4 before:w-24 before:h-[0.5px] before:bg-gray-200 after:w-24 after:h-[0.5px] after:bg-gray-200 flex items-center justify-center after:ml-4 text-sm w-full">
                OR
              </div>
              <Button
                className="flex gap-3 w-full border border-primary bg-transparent text-primary hover:bg-gray-100 hover:border-0"
                onClick={handleGoogle}
              >
                <span>
                  <Image
                    src={googleLogo}
                    width={16}
                    height={16}
                    alt="google logo"
                  />
                </span>
                Register with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
