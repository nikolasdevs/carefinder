// import { auth, firestore } from "@/app/firebase/config";
// import { doc, getDoc } from "firebase/firestore";

// const getUserRole = async (uid: string) => {
//   const user = auth.currentUser;
//   if (user) {
//     const userDocRef = doc(firestore, "admin", user.uid);
//     const userDoc = await getDoc(userDocRef);
//     if (userDoc.exists()) {
//       const userData = userDoc.data();
//       return userData?.role;
//     }
//   }
//   return null;
// };

// export default getUserRole

import { firestore } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const getUserRole = async (userId: string) => {
  try {
    const userDocRef = doc(firestore, "admin", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData?.role;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
