"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "../firebase/config";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import AdminNavbar from "../AdminNavbar";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import HospitalForm from "@/utils/hospitalDoc";
import Papa from "papaparse";

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hospitals, setHospitals] = useState<DocumentData[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchHospitals = async () => {
      const hospitalDocs = await getDocs(collection(firestore, "hospitals"));
      const hospitalList = hospitalDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHospitals(hospitalList);
    };

    fetchHospitals();
  }, [showForm]);

  const fetchHospitalData = async () => {
    const hospitalDocs = await getDocs(collection(firestore, "hospitals"));
    const hospitalList = hospitalDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setHospitals(hospitalList);
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const handleAddNew = () => {
    setSelectedHospitalId(null);
    setShowForm(true);
  };

  const handleEdit = (id: React.SetStateAction<string | null>) => {
    setSelectedHospitalId(id);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setSelectedHospitalId(null);
  };

  const handleDelete = async (id: string | null) => {
    try {
      if (id) {
        const hospitalRef = doc(firestore, "hospitals", id);
        await deleteDoc(hospitalRef);
        setHospitals(hospitals.filter((hospital) => hospital.id !== id));
      }
      setShowForm(false);
      setSelectedHospitalId(null);
    } catch (error) {
      console.error("Error deleting hospital:", error);
      alert("Error deleting hospital.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedHospitalId(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/admin/adminLogin");
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const seenAddresses = new Set();
          const hospitalsByState = results.data
            .map((row: any) => ({
              name: row.name || "Unknown", // Provide a default value or handle missing fields
              address: row.address || "Unknown",
              phone: row.phone || "Unknown",
              lga: row.lga || "Unknown",
              state: row.state || "Unknown",
            }))
            .reduce((acc: any, hospital: any) => {
              if (!acc[hospital.state]) {
                acc[hospital.state] = [];
              }
              acc[hospital.state].push(hospital);
              return acc;
            }, {});

          const batch = writeBatch(firestore);
          const hospitalsRef = collection(firestore, "hospitals");

          for (const state in hospitalsByState) {
            const hospitals = hospitalsByState[state];
            for (const hospital of hospitals) {
              const querySnapshot = await getDocs(
                query(hospitalsRef, where("address", "==", hospital.address))
              );

              if (querySnapshot.empty) {
                batch.set(doc(hospitalsRef), hospital);
              } else {
                console.log(`Duplicate address found: ${hospital.address}`);
              }
            }
          }

          await batch.commit();
          alert("CSV data uploaded successfully!");
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV file.");
        },
      });
    }
  };
  return (
    <>
      <AdminNavbar />
      <main className="mt-10 px-10">
        <div className="text-neutral-800">
          {showForm ? (
            <HospitalForm
              hospitalId={selectedHospitalId}
              onSave={handleSave}
              onDelete={() => handleDelete(selectedHospitalId)}
              onCancel={handleCancel}
            />
          ) : (
            <>
              <button
                onClick={handleAddNew}
                className="bg-primary-dark text-white p-2 rounded"
              >
                Add New Hospital
              </button>
              <input
                type="file"
                accept=".csv"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleFileUpload(event)
                }
                className="ml-4"
              />

              <div className="flex font-medium gap-2 items-center justify-between border-b-2 border-b-neutral-300 px-4 mt-5 text-sm">
                <h2 className="hospital-headers">Name</h2>
                <h2 className="hospital-headers">Address</h2>
                <h2 className="hospital-headers">Phone</h2>
                <h2 className="hospital-headers">LGA</h2>
                <h2 className="hospital-headers">State</h2>
                <Menu>
                  <MenuButton className="">
                    <EllipsisVerticalIcon className="size-6 invisible" />
                  </MenuButton>
                </Menu>
              </div>
              <ul className="">
                {hospitals.map((hospital) => (
                  <li
                    key={hospital.id}
                    className="flex gap-2 items-center justify-between border-b border-b-neutral-300 px-4 "
                  >
                    <p className=" hospital-list ">{hospital.name}</p>
                    <p className=" hospital-list ">{hospital.address}</p>
                    <p className=" hospital-list ">{hospital.phone}</p>
                    <p className=" hospital-list ">{hospital.lga}</p>
                    <p className=" hospital-list ">{hospital.state}</p>

                    <Menu as="div" className="relative flex">
                      <MenuButton className="">
                        <EllipsisVerticalIcon className="size-6 text-neutral-500" />
                      </MenuButton>

                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-8 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in flex flex-col justify-between gap-4 p-2"
                      >
                        <div>
                          <MenuItem>
                            <p
                              onClick={() => handleEdit(hospital.id)}
                              className=" text-neutral-500 px-4 py-2 text-sm data-[focus]:bg-gray-100 cursor-pointer"
                            >
                              Edit
                            </p>
                          </MenuItem>
                          <MenuItem>
                            <p
                              onClick={() => handleDelete(hospital.id)}
                              className="text-neutral-500 px-4 py-2 text-sm  data-[focus]:bg-gray-100 cursor-pointer"
                            >
                              Delete
                            </p>
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Menu>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminPage;
