"use client";
import React, { useState, useEffect } from "react";
import { firestore } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { getErrorMessage } from "@/utils/errorHandler";
import { fetchStates } from "@/app/lib/fetchStates";
import { fetchLga } from "@/app/lib/fetchLga";

const AdminPage = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [lga, setLga] = useState("");
  const [state, setState] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStates = async () => {
      const fetchedStates = await fetchStates();
      setStates(fetchedStates);
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (state) {
      const loadLgas = async () => {
        const fetchedLga = await fetchLga(state);
        setLgas(fetchedLga);
      };
      loadLgas();
    } else {
      setLgas([]);
    }
  }, [state]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const hospitalRef = collection(firestore, "hospitals");
      const hospitalData = {
        name,
        address,
        phone,
        state,
        lga,
      };
      await addDoc(hospitalRef, hospitalData);
      setName("");
      setAddress("");
      setPhone("");
      setState("");
      setLga("");
      setError(null);
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className=" text-neutral-800">
      <h1>Admin Page</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Address:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <br />
        <label>
          Phone:
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <br />
        <label>
          State:
          <select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Local Government:
          <select
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
        </label>
        <br />
        <button type="submit">Create Hospital</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminPage;
