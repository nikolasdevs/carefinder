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
          <div className="w-24">
            {" "}
            <Image src={Logo} alt="Company logo" />
          </div>{" "}
          <ModeToggle />
        </div>
        <div className="h-screen w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center text-center ">
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
              <h1 className="text-6xl font-bold  leading-snug">
                Welcome to Carefinder!
              </h1>

              <p className="text-xl text-center ">
                Find, Export and Share the Nearest Hospitals Around You!
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{
              x: 0,
              scale: 1,
            }}
            animate={{
              x: -1000,
              scale: 1,
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className=" flex items-center justify-center">
              <Image src={hero} alt="" className="w-1/2" />
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
