import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { Router } from "next/router";

const AuthListener = ({ auth, firestore, setUser, setLoading, router }: { auth: any, firestore: any, setUser: any, setLoading: any, router: Router }) => {

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Do something with userData if needed
        }
      } else {
        setLoading(true);
        router.push("/user/login");
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, setUser, setLoading]);

  return null; // This component doesn't render anything
};

export default AuthListener;