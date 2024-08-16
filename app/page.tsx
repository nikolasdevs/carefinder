"use client";
import Image from "next/image";
import hero from "../public/heroImg.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/theme-toggle";
import Logo from "../public/logo.png";

export default function Home() {
  return (
    <main className="h-screen">
      <div className="w-full h-screen flex flex-col items-center md:justify-center md:mt-0 mt-10 m-auto gap-4 ">
        <div className="w-full flex justify-between px-10 items-center py-5">
          <Link href="/" className="w-24">
            {" "}
            <Image src={Logo} alt="Company logo" />
          </Link>{" "}
          <ModeToggle />
        </div>
        <div className="h-full w-full flex flex-col items-center justify-between my-10">
          <div className="flex flex-col w-full items-center text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.4,
                },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: 0.3,
                  },
                },
              }}
            >
              <h1 className="md:text-6xl text-4xl font-bold px-4  leading-snug">
                Welcome to Carefinder!
              </h1>

              {/* <p className="text-xl text-center ">
                Find, Export and Share the Nearest Hospitals Around You!
              </p> */}
            </motion.div>
            <motion.div
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
              transition={{
                delay: 2,
                duration: 5,
                ease: "easeInOut",
              }}
            >
              <div className="flex md:flex-row flex-col gap-5 items-center md:text-6xl text-4xl font-black mt-5">
                <p className=" text-red-300">Find. </p>
                <p className=" text-blue-400">Export.</p>
                <p className=" text-blue-400">Share.</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{
              x: 500,
            }}
            animate={{
              x: -1500,
            }}
            transition={{
              duration: 8,

              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <div className=" flex justify-end">
              <Image src={hero} alt="" className="w-1/3" />
            </div>
          </motion.div>
          <Link href="/user/login">
            <Button className="  ">ENTER</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
