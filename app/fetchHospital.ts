import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "./firebase/config";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Papa from "papaparse";

// Define the Hospital type
type State = {
  id: string;
  lga: string;
};

type Lga = {
  id: string;
  state: State;
};

type Hospital = {
  id?: string; // Optional for new hospitals
  state: State;
  lga: Lga;
  name: string;
  address: string;
  phone: string;
  // Add other fields as necessary
};

// Fetch hospitals based on lga and state
const fetchHospitals = async (
  lgaId: string,
  stateId: string
): Promise<Hospital[]> => {
  const hospitalsCollection = collection(firestore, "hospitals");
  const q = query(
    hospitalsCollection,
    where("lga.id", "==", lgaId),
    where("state.id", "==", stateId)
  );
  const hospitalDocs = await getDocs(q);
  const hospitals = hospitalDocs.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Hospital)
  );
  console.log(hospitals);
  return hospitals;
};

// Export hospitals to CSV and upload to Firebase Storage
const exportHospitalsToCSV = async (lgaId: string, stateId: string) => {
  const hospitals = await fetchHospitals(lgaId, stateId);
  const csvString = Papa.unparse(hospitals);
  const blob = new Blob([csvString], { type: "text/csv" });

  const storage = getStorage();
  const fileRef = ref(storage, `hospitals-${lgaId}-${stateId}.csv`);
  await uploadBytes(fileRef, blob);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

// Create a new hospital
const createHospital = async (hospital: Hospital) => {
  const hospitalsCollection = collection(firestore, "hospitals");
  await setDoc(doc(hospitalsCollection), hospital);
};

// Update an existing hospital
const updateHospital = async (
  hospitalId: string,
  hospital: Partial<Hospital>
) => {
  const hospitalDocRef = doc(firestore, "hospitals", hospitalId);
  await updateDoc(hospitalDocRef, hospital);
};

// Delete a hospital
const deleteHospital = async (hospitalId: string) => {
  const hospitalDocRef = doc(firestore, "hospitals", hospitalId);
  await deleteDoc(hospitalDocRef);
};

export {
  fetchHospitals,
  exportHospitalsToCSV,
  createHospital,
  updateHospital,
  deleteHospital,
};
