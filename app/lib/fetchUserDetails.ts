import { updateDoc, doc, Firestore, getDoc } from "firebase/firestore";


export const fetchUserData = async (firestore: Firestore, userId: string) => {
  try {
    const userDocRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.error("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const updateUserData = async (
  firestore: Firestore,
  userId: string,
  updatedData: any
) => {
  try {
    const userDocRef = doc(firestore, "users", userId);
    await updateDoc(userDocRef, updatedData);
    console.log("User data updated successfully!");
  } catch (error) {
    console.error("Error updating user data:", error);
  }
};
