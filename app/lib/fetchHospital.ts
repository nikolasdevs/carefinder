import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import axios from "axios";
import { firestore } from "../firebase/config";

export interface Type {
  id: string;
  name: string;
}
export interface State {
  id: string;
  name: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  location: string;
  state: {
    id: string;
    name: string;
  };
  type: {
    id: string;
    name: string;
  };
}

export const fetchHospitalData = async (
  queryState: string | string[] | undefined,
  queryAddress: string | string[] | undefined,
  state: string
): Promise<Hospital[]> => {
  const response = await axios.get("https://api.reliancehmo.com/v3/providers");
  const data = response.data.data; // Access the data property of the response object
  const hospitals: Hospital[] = data.map(
    (hospital: {
      id: any;
      name: any;
      location: any;
      address: any;
      phone_number: any;
      type: any;
      state: any;
    }) => ({
      id: hospital.id,
      name: hospital.name,
      location: hospital.location,
      address: hospital.address,
      type: hospital.type,
      phone_number: hospital.phone_number,
      state: hospital.state,
    })
  );
  return hospitals;
};

export const filterHospitalsByState = (
  hospitals: Hospital[],
  state: string
): Hospital[] => {
  return hospitals.filter((hospital) => hospital.state.name === state);
};

export const filterHospitalsByAddress = (
  hospitals: Hospital[],
  addressQuery: string
) => {
  if (!addressQuery) return hospitals;

  const queryWords = addressQuery.toLowerCase().split(" ");
  return hospitals.filter((hospital) =>
    queryWords.every((word) => hospital.address.toLowerCase().includes(word))
  );
};

const createHospital = async (hospital: Hospital) => {
  const hospitalsCollection = collection(firestore, "hospitals");
  const hospitalDocRef = doc(hospitalsCollection);
  await setDoc(hospitalDocRef, hospital);
};

const updateHospital = async (id: string, updatedData: Partial<Hospital>) => {
  try {
    const hospitalDocRef = doc(firestore, "hospitals", id);
    await updateDoc(hospitalDocRef, updatedData);
    console.log(`Hospital with ID ${id} updated successfully`);
  } catch (error) {
    console.error("Error updating hospital:", error);
  }
};

const deleteHospital = async (hospitalId: string) => {
  const hospitalDocRef = doc(firestore, "hospitals", hospitalId);
  await deleteDoc(hospitalDocRef);
};

export const fetchHospitalDataById = async (id: string) => {
  const hospitalDocRef = doc(firestore, "hospitals", id);
  const docSnap = await getDoc(hospitalDocRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Hospital;
  } else {
    throw new Error("No such document!");
  }
};

export { createHospital, updateHospital, deleteHospital };
