"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore } from "../firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { fetchStates } from "../lib/fetchStates";
import { fetchLga } from "../lib/fetchLga";
import Papa from "papaparse";

const DashboardPage = () => {
  const [states, setStates] = useState<string[]>([]);
  const [state, setState] = useState<string>("");
  const [lgas, setLgas] = useState<string[]>([]);
  const [lga, setLga] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const loadStates = async () => {
      const fetchedStates = await fetchStates();
      setStates(fetchedStates);
    };
    loadStates();
  });

  useEffect(() => {
    const loadLgas = async () => {
      if (state) {
        const fetchedLgas = await fetchLga(state);
        setLgas(fetchedLgas);
      } else {
        setLgas([]);
      }
    };
    loadLgas();
  }, [state]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleChangePassword = () => {
    router.push("/changePassword");
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const hospitalsCollection = collection(firestore, "hospitals");
      const q = query(
        hospitalsCollection,
        where("state", "==", state),
        where("lga", "==", lga)
      );
      const hospitalDocs = await getDocs(q);
      const fetchedHospitals = hospitalDocs.docs.map((doc) => doc.data());
      setHospitals(fetchedHospitals);
    } catch (error) {
      setError("Failed to fetch hospitals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = hospitals.map((hospital) => ({
      Name: hospital.name,
      Address: hospital.address,
      Phone: hospital.phone,
      State: hospital.state,
      Town: hospital.lga,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "hospitals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 text-neutral-800">
      <h1 className="text-2xl mb-4">Search Hospitals</h1>
      <div className="mb-4">
        <select
          className="border p-2 rounded"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <select
          className="border p-2 rounded ml-2"
          value={lga}
          onChange={(e) => setLga(e.target.value)}
          disabled={!state}
        >
          <option value="">Select Local Government</option>
          {lgas.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white p-2 rounded ml-4"
          onClick={handleSearch}
          disabled={!state || !lga}
        >
          Search
        </button>
      </div>
      {loading && <p>Loading hospitals...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {hospitals.length > 0 && (
        <div>
          <h2 className="text-xl mb-2">Hospital Results</h2>
          <ul>
            {hospitals.map((hospital, index) => (
              <li key={index} className="border p-2 mb-2">
                <h3 className="text-lg font-bold">{hospital.name}</h3>
                <p>{hospital.address}</p>
                <p>{hospital.phone}</p>
                <p>
                  {hospital.state}, {hospital.lga}
                </p>
              </li>
            ))}
          </ul>
          <button
            className="bg-green-500 text-white p-2 rounded mt-4"
            onClick={exportToCSV}
          >
            Export to CSV
          </button>
        </div>
      )}
      <button
        className="bg-red-500 text-white p-2 rounded mt-4"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
