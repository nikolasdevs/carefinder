import Image from "next/image";
import hero from "../public/heroImg.png";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-neutral-100   text-neutral-500 h-screen">
      <div className="w-full h-full flex flex-col items-center justify-center m-auto gap-4">
        <div className=" flex flex-col items-center justify-center gap-3 text-center ">
          <h1 className="text-6xl font-bold  leading-snug">
            Welcome to Carefinder!
          </h1>
          <p className="text-xl text-center ">
            Find the nearest hospital around you!
          </p>
        </div>
        <div className="w-1/2 flex flex-col items-center">
          <Image src={hero} alt="" />
        </div>{" "}
        <Link href="/login">
          <button className=" hover:bg-primary-dark hover:text-primary-light  py-3 px-4 rounded-xl border border-primary-dark text-primary-dark">
            ENTER
          </button>
        </Link>
      </div>
    </main>
  );
}
