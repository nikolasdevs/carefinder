
import { firestore } from "../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";

const storeHospitalData = async (hospital: any) => {
  try {
    const docRef = await addDoc(collection(firestore, "hospitals"), hospital);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default storeHospitalData;


