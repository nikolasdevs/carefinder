import { Disclosure } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, firestore } from "./firebase/config";
import { useEffect, useState } from "react";
import { doc, getDoc } from "@firebase/firestore";
import Image from "next/image";
import logo from "../public/heroImg.png";
import Link from "next/link";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { LogOut, Menu, Settings, User as UserMenu } from "lucide-react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
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
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 shadow-on-scroll">
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
          <div className=" flex">
            <MenubarMenu>
              <MenubarTrigger>Dashboard</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>About</MenubarTrigger>
            </MenubarMenu>
          </div>
        </Menubar>

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          {/* Profile dropdown */}

          <Menubar className="bg-transparent ">
            <MenubarMenu>
              <MenubarTrigger className=" cursor-pointer focus:bg-transparent focus:text-primary/70 hover:text-primary/70 data-[state=open]:text-primary/70 data-[state=open]:bg-transparent">
                {user?.displayName} {user?.email}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarCheckboxItem>
                  {" "}
                  <UserMenu className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </MenubarCheckboxItem>
                <MenubarCheckboxItem checked>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </MenubarCheckboxItem>

                <MenubarSeparator />

                <MenubarItem onClick={handleLogout} inset>
                  {" "}
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </div>
  );
}
