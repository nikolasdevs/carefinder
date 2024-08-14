import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "@firebase/firestore";

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
import { getErrorMessage } from "@/utils/errorHandler";
import { auth, firestore } from "@/app/firebase/config";

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
        router.push("/admin/adminLogin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/adminLogin");
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="max-w-full px-2 sm:px-6 lg:px-8 shadow-on-scroll">
      <div className="relative flex h-16 items-center justify-end">
        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>
                {" "}
                <Menu />{" "}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem className="cursor-pointer">Dashboard</MenubarItem>

                <MenubarItem className="cursor-pointer">About</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          {/* Profile dropdown */}

          <Menubar className="bg-transparent ">
            <MenubarMenu>
              <MenubarTrigger className=" cursor-pointer focus:bg-transparent focus:text-primary/70 hover:text-primary/70 data-[state=open]:text-primary/70 data-[state=open]:bg-transparent">
                {user?.displayName} {user?.email}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <UserMenu className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </MenubarItem>
                <MenubarItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </MenubarItem>

                <MenubarSeparator className="mt-4" />

                <MenubarItem onClick={handleLogout}>
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
