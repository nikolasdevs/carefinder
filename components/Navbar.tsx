import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "@firebase/firestore";
import Logo from "../public/logo.png";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { LogOut, Menu, Settings, User as UserMenu } from "lucide-react";
import { getErrorMessage } from "@/utils/errorHandler";
import { auth, firestore } from "@/app/firebase/config";
import { ModeToggle } from "./theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      } else {
        router.push("/user/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/user/login");
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="  px-2 sm:px-6 lg:px-8 shadow-on-scroll bg-inherit">
      <div className="relative flex h-16 items-center justify-between">
        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>
                {" "}
                <Menu />{" "}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Dashboard</MenubarItem>
                <MenubarItem>About</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <Menubar className=" sm:flex justify-between hidden">
          <Link href="/user" className=" flex">
            <Image src={Logo} alt="company logo" height={40} />
          </Link>
        </Menubar>

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <Menubar className="bg-transparent ">
            <MenubarMenu>
              <MenubarTrigger className=" cursor-pointer focus:bg-transparent focus:text-primary/70 hover:text-primary/70 data-[state=open]:text-primary/70 data-[state=open]:bg-transparent">
                {user?.displayName} {user?.email}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  {" "}
                  <UserMenu className="mr-2 h-4 w-4" />
                  <Link href="/user">Profile</Link>
                </MenubarItem>
                <MenubarItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleLogout}>
                  {" "}
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
