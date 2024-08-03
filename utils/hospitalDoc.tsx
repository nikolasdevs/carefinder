"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getErrorMessage } from "@/utils/errorHandler";
import { fetchStates } from "@/app/lib/fetchStates";
import { fetchLga } from "@/app/lib/fetchLga";
import { marked } from "marked";
import { firestore } from "@/app/firebase/config";

interface HospitalFormProps {
  hospitalId?: string | null;
  onSave: () => void;
  onDelete: () => void;
  onCancel?: () => void;
}

const HospitalForm = ({
  hospitalId,
  onSave,
  onDelete,
  onCancel,
}: HospitalFormProps) => {
  const [markdown, setMarkdown] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
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

  useEffect(() => {
    if (hospitalId) {
      const loadHospital = async () => {
        try {
          const hospitalRef = doc(firestore, "hospitals", hospitalId);
          const hospitalDoc = await getDoc(hospitalRef);
          if (hospitalDoc.exists()) {
            const hospitalData = hospitalDoc.data();
            setMarkdown(`
### ${hospitalData.name}
#### Address: ${hospitalData.address}
#### Phone: ${hospitalData.phone}
            `);
            setState(hospitalData.state);
            setLga(hospitalData.lga);
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching hospital:", error);
        }
      };
      loadHospital();
    }
  }, [hospitalId]);

  const parseMarkdown = (markdown: string) => {
    const tokens = marked.lexer(markdown);
    const hospitalData: { [key: string]: string } = {};

    tokens.forEach((token) => {
      if (token.type === "heading" && token.depth === 3) {
        hospitalData["name"] = token.text;
      } else if (token.type === "heading" && token.depth === 4) {
        if (token.text.startsWith("Address")) {
          hospitalData["address"] = token.text.replace("Address: ", "");
        } else if (token.text.startsWith("Phone")) {
          hospitalData["phone"] = token.text.replace("Phone: ", "");
        }
      } else if (token.type === "paragraph") {
        const [key, value] = token.text.split(": ");
        if (key && value) {
          hospitalData[key.toLowerCase()] = value;
        }
      }
    });

    return hospitalData;
  };
  const handleInsertTemplate = () => {
    const template = `Name:

Address:

Phone:
    `;
    setMarkdown(template);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const parsedData = parseMarkdown(markdown);
      if (!parsedData.name) {
        setError("Hospital name is required in the markdown.");
        return;
      }
      parsedData.state = state;
      parsedData.lga = lga;

      if (hospitalId) {
        const hospitalRef = doc(firestore, "hospitals", hospitalId);
        await updateDoc(hospitalRef, parsedData);
      } else {
        const hospitalRef = collection(firestore, "hospitals");
        await addDoc(hospitalRef, parsedData);
      }
      onSave();
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      if (hospitalId) {
        const hospitalRef = doc(firestore, "hospitals", hospitalId);
        await deleteDoc(hospitalRef);
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting hospital:", error);
      setError("Error deleting hospital.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center gap-5">
      <h1 className="text-2xl my-5 font-semibold">
        {hospitalId ? "Update Hospital" : "Create New Hospital"}
      </h1>
      <div className=" flex flex-col  items-start gap-3 rounded-xl  ">
        <button
          onClick={handleInsertTemplate}
          className=" text-primary-dark hover:underline mt-5"
        >
          Insert Template
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={7}
            cols={30}
            className=" border rounded-md p-4 resize-none outline-none"
          />
          <label className=" flex border px-2 py-3 rounded-md ">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className=" outline-none w-full "
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className=" flex border px-2 py-3 rounded-md ">
            <select
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              disabled={!state}
              className="outline-none w-full"
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
          <button
            type="submit"
            className="bg-primary-dark text-white p-2 rounded"
          >
            {hospitalId ? "Update Hospital" : "Create Hospital"}
          </button>
          {hospitalId && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded"
            >
              Delete Hospital
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white p-2 rounded"
            >
              Cancel
            </button>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default HospitalForm;
