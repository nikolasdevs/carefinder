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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const firestore = getFirestore();

interface MarkdownEditorProps {
  hospitalData?: Hospital;
  onSave: (hospital: Hospital) => void;
  onCancel: () => void;
}

const MarkdownEditor = ({
  hospitalData,
  onSave,
  onCancel,
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
  const [state, setState] = useState<string>("");

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
    <>
      <div className=" flex flex-col items-center justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className=" flex flex-col  z-50 w-full items-center gap-2 "
        >
          <Input
            name="name"
            value={hospital.name}
            onChange={handleInputChange}
            className="input"
            placeholder="Hospital Name"
          />
          <Input
            name="address"
            value={hospital.address}
            onChange={handleInputChange}
            placeholder="Address"
            className="input"
          />
          <Input
            name="phone_number"
            value={hospital.phone_number}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="input"
          />
          <Input
            name="location"
            value={hospital.location}
            onChange={handleInputChange}
            placeholder="Location"
            className="input"
          />

          <Select
            name="state"
            value={hospital.state.id}
            onValueChange={(value) =>
              setHospital((prevHospital) => ({
                ...prevHospital,
                state: { id: value, name: value },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.name}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            name="type"
            value={hospital.type.id}
            onValueChange={(value) =>
              setHospital((prevHospital) => ({
                ...prevHospital,
                type: {
                  id: value,
                  name: types.find((t) => t.id === value)?.name || "",
                },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className=" mt-4 flex w-full gap-4">
            <Button type="submit" className="w-full">
              Save
            </Button>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </>
  );
};

export default MarkdownEditor;
