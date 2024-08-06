"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../firebase/config";
import AdminNavbar from "../AdminNavbar";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { DotsThreeOutlineVertical } from "@phosphor-icons/react";
import {
  fetchHospitalData,
  filterHospitalsByState,
  Hospital,
  Type,
} from "../lib/fetchHospital";
import { fetchStates } from "../lib/fetchStates";
import MarkdownEditor from "../EditHospital";

function isHospital(data: any): data is Hospital {
  return (
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.name === "string" &&
    typeof data.address === "string" &&
    typeof data.phone_number === "string" &&
    typeof data.location === "string" &&
    typeof data.state === "object" &&
    typeof data.type === "object"
  );
}
const AdminPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [state, setState] = useState<string>("");
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchHospitalData(state);
      if (data) {
        setHospitals(data);
        setFilteredHospitals(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [state]);

  useEffect(() => {
    const loadStates = async () => {
      setLoading(true);
      const fetchedStates = await fetchStates();
      const statesData = fetchedStates.map((state) => ({
        id: state,
        name: state,
      }));
      setStates(statesData);
      setLoading(false);
    };
    loadStates();
  }, []);

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      try {
        const typesCollection = collection(firestore, "types");
        const typesSnapshot = await getDocs(typesCollection);
        const typesList = typesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Type[];
        setTypes(typesList);
      } catch (error) {
        console.error("Error fetching types:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTypes();
  }, []);

  const handleFilterByState = () => {
    const filtered = filterHospitalsByState(hospitals, state);
    setFilteredHospitals(filtered);
  };

  const handleResetFilters = () => {
    setState("");
    setFilteredHospitals(hospitals);
  };

  const handleAddNew = () => {
    setSelectedHospitalId(null);
    setShowForm(true);
  };

  const handleAddHospital = async (newHospital: Hospital) => {
    try {
      const hospitalRef = collection(firestore, "hospitals");
      const newHospitalRef = await addDoc(hospitalRef, newHospital);
      setHospitals([...hospitals, { ...newHospital, id: newHospitalRef.id }]);
      setFilteredHospitals([
        ...filteredHospitals,
        { ...newHospital, id: newHospitalRef.id },
      ]);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding hospital:", error);
    }
  };

  const handleUpdateHospital = async (updatedHospital: Hospital) => {
    if (!isHospital(updatedHospital)) {
      throw new Error("Invalid hospital data");
    }

    try {
      const hospitalRef = doc(firestore, "hospitals", updatedHospital.id);
      const updatedHospitalData = {
        ...updatedHospital,
      };
      await updateDoc(hospitalRef, updatedHospitalData);
      const updatedList = hospitals.map((hospital) =>
        hospital.id === updatedHospital.id ? updatedHospital : hospital
      );
      setHospitals(updatedList);
      setFilteredHospitals(updatedList);
      setShowForm(false);
      setSelectedHospitalId(null);
    } catch (error) {
      console.error("Error updating hospital:", error);
    }
  };

  const handleEdit = (id: string | null) => {
    setSelectedHospitalId(id);
    setShowForm(true);
  };

  const handleSave = (hospital: Hospital) => {
    if (hospital.id) {
      handleUpdateHospital(hospital);
    } else {
      handleAddHospital(hospital);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedHospitalId(null);
  };

  const handleDelete = async (id: string | null | undefined) => {
    if (id) {
      try {
        await deleteDoc(doc(firestore, "hospitals", id));
        setHospitals(hospitals.filter((hospital) => hospital.id !== id));
        setFilteredHospitals(
          filteredHospitals.filter((hospital) => hospital.id !== id)
        );
        setShowForm(false);
        setSelectedHospitalId(null);
      } catch (error) {
        console.error("Error deleting hospital:", error);
      }
    }
  };

  const selectedHospital =
    hospitals.find((hospital) => hospital.id === selectedHospitalId) ||
    undefined;
  return (
    <div className="w-full h-full px-8 py-4 overflow-hidden">
      <AdminNavbar />
      <div className="w-full h-[calc(100%-3rem)] flex flex-col gap-4">
        <div className="w-full h-10 flex items-center gap-2">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="px-4 py-1.5 text-sm rounded-lg outline-none bg-white border border-solid border-gray-300"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <button
                className="px-4 py-1.5 text-sm rounded-lg outline-none text-white bg-blue-500"
                onClick={handleFilterByState}
              >
                Filter
              </button>
              <button
                className="px-4 py-1.5 text-sm rounded-lg outline-none text-white bg-blue-500"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
              <button
                className="px-4 py-1.5 text-sm rounded-lg outline-none text-white bg-green-500"
                onClick={handleAddNew}
              >
                Add New Hospital
              </button>
            </>
          )}
        </div>

        {showForm && (
          <MarkdownEditor
            hospitalData={selectedHospital}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={() => handleDelete(selectedHospitalId)}
          />
        )}

        <div className="w-full h-full overflow-y-auto rounded-lg border border-solid border-gray-300">
          <table className="w-full h-full text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="h-10 text-left">
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  Address
                </th>
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  Phone Number
                </th>
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  Location
                </th>
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  State
                </th>
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 border-b border-solid border-gray-300 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.map((hospital) => (
                <tr key={hospital.id} className="h-10">
                  <td className="px-4 border-b border-solid border-gray-300">
                    {hospital.name}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300">
                    {hospital.address}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300">
                    {hospital.phone_number}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300">
                    {hospital.location}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300">
                    {hospital.state?.name || "N/A"}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300">
                    {hospital.type?.name || "N/A"}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300">
                    <Menu>
                      <MenuButton className="outline-none">
                        <DotsThreeOutlineVertical className="w-6 h-6" />
                      </MenuButton>
                      <MenuItems className="flex flex-col items-start gap-2 w-36 py-2 bg-white shadow-lg rounded-md border border-solid border-gray-300">
                        <MenuItem
                          as="button"
                          className="w-full px-3 text-left text-xs hover:bg-gray-100"
                          onClick={() => handleEdit(hospital.id)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          as="button"
                          className="w-full px-3 text-left text-xs hover:bg-gray-100"
                          onClick={() => handleDelete(hospital.id)}
                        >
                          Delete
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
