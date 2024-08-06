import { useEffect, useState } from "react";
import { Hospital } from "./lib/fetchHospital";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { fetchStates } from "./lib/fetchStates";

const firestore = getFirestore();

interface MarkdownEditorProps {
  hospitalData?: Hospital;
  onSave: (hospital: Hospital) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const MarkdownEditor = ({
  hospitalData,
  onSave,
  onCancel,
  onDelete,
}: MarkdownEditorProps) => {
  const [hospital, setHospital] = useState<Hospital>({
    id: hospitalData?.id || "",
    name: hospitalData?.name || "",
    address: hospitalData?.address || "",
    phone_number: hospitalData?.phone_number || "",
    location: hospitalData?.location || "",
    state: hospitalData?.state || { id: "", name: "" },
    type: hospitalData?.type || { id: "", name: "" },
  });

  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatesData = async () => {
      const fetchedStates = await fetchStates();
      const statesData = fetchedStates.map((state) => ({
        id: state,
        name: state,
      }));
      setStates(statesData);
    };
    fetchStatesData();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const typesCollection = collection(firestore, "types");
        const typesSnapshot = await getDocs(typesCollection);
        const typesList = typesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as { id: string; name: string }[];
        setTypes(typesList);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };
    fetchTypes();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setHospital({ ...hospital, [name]: value });
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value, options, selectedIndex } = event.target;
    setHospital((prevHospital) => ({
      ...prevHospital,
      [name]: {
        id: value,
        name: options[selectedIndex].text,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const hospitalRef = hospital.id
        ? doc(firestore, "hospitals", hospital.id)
        : null;

      const hospitalData = {
        ...hospital,
        name: hospital.name,
        address: hospital.address,
        phone_number: hospital.phone_number,
        location: hospital.location,
        state: hospital.state,
        type: hospital.type,
      };

      if (hospitalRef) {
        await updateDoc(hospitalRef, hospitalData);
      } else {
        const newHospitalRef = await addDoc(
          collection(firestore, "hospitals"),
          hospitalData
        );
        hospitalData.id = newHospitalRef.id;
      }

      onSave({ ...hospital, ...hospitalData });
    } catch (error) {
      console.error("Error updating or adding hospital:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={hospital.name}
        onChange={handleInputChange}
        className="input"
        placeholder="Hospital Name"
      />
      <input
        name="address"
        value={hospital.address}
        onChange={handleInputChange}
        placeholder="Address"
        className="input"
      />
      <input
        name="phone_number"
        value={hospital.phone_number}
        onChange={handleInputChange}
        placeholder="Phone Number"
        className="input"
      />
      <input
        name="location"
        value={hospital.location}
        onChange={handleInputChange}
        placeholder="Location"
        className="input"
      />
      <select
        name="state"
        value={hospital.state.id}
        onChange={handleSelectChange}
        className="input"
      >
        <option value="">Select State</option>
        {states.map((state) => (
          <option key={state.id} value={state.id}>
            {state.name}
          </option>
        ))}
      </select>
      {/* <select
        name="type"
        value={hospital.type.id}
        onChange={handleSelectChange}
        className="input"
      >
        <option value="">Select Type</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select> */}
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {hospitalData && (
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default MarkdownEditor;
