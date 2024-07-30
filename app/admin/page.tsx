"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore } from "../firebase/config";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

const AdminPageWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push("/admin/adminLogin");
      } catch (error) {
        console.error("Logout Error:", error);
      }
    };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/admin/adminLogin"); // Redirect to login if not admin
        }
      } else {
        router.push("/admin/adminLogin");
      }
    });

   

    return () => unsubscribe();
  }, [router]);

  if (!isAdmin) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>signOut</button>
      <Link href={"/admin/createNew"}>
        <button>Create New</button>{" "}
      </Link>{" "}
    </div>
  );
};

export default AdminPageWrapper;
