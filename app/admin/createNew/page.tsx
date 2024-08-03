// "use client";
// import React, { useState, useEffect } from "react";
// import { firestore } from "../../firebase/config";
// import { collection, addDoc } from "firebase/firestore";
// import { getErrorMessage } from "@/utils/errorHandler";
// import { fetchStates } from "@/app/lib/fetchStates";
// import { fetchLga } from "@/app/lib/fetchLga";
// import AdminNavbar from "../../AdminNavbar";
// import { marked } from "marked";

// const AdminPage = () => {
//   const [markdown, setMarkdown] = useState("");
//   const [name, setName] = useState("");
//   const [address, setAddress] = useState("");
//   const [phone, setPhone] = useState("");
// const [lga, setLga] = useState("");
//  const [state, setState] = useState("");
//   const [states, setStates] = useState<string[]>([]);
//   const [lgas, setLgas] = useState<string[]>([]);
//   const [error, setError] = useState<string | null>(null);

// useEffect(() => {
//   const loadStates = async () => {
//     const fetchedStates = await fetchStates();
//     setStates(fetchedStates);
//   };
//   loadStates();
// }, []);

// useEffect(() => {
//   if (state) {
//     const loadLgas = async () => {
//       const fetchedLga = await fetchLga(state);
//       setLgas(fetchedLga);
//     };
//     loadLgas();
//   } else {
//     setLgas([]);
//   }
// }, [state]);

//   // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
//   //   try {
//   //     const hospitalRef = collection(firestore, "hospitals");
//   //     const hospitalData = {
//   //       name,
//   //       address,
//   //       phone,
//   //       state,
//   //       lga,
//   //     };
//   //     await addDoc(hospitalRef, hospitalData);
//   //     setName("");
//   //     setAddress("");
//   //     setPhone("");
//   //     setState("");
//   //     setLga("");
//   //     setError(null);
//   //   } catch (e) {
//   //     const errorMessage = getErrorMessage(e);
//   //     console.error(errorMessage);
//   //     alert(errorMessage);
//   //   }
//   // };
//   const parseMarkdown = (markdown: string) => {
//     const tokens = marked.lexer(markdown);
//     const hospitalData: { [key: string]: string } = {};

//     tokens.forEach((token) => {
//       if (token.type === "heading" && token.depth === 3) {
//         hospitalData["name"] = token.text;
//       } else if (token.type === "heading" && token.depth === 4) {
//         if (token.text.startsWith("Address")) {
//           hospitalData["address"] = token.text.replace("Address: ", "");
//         } else if (token.text.startsWith("Phone")) {
//           hospitalData["phone"] = token.text.replace("Phone: ", "");
//         }
//       } else if (token.type === "paragraph") {
//         const [key, value] = token.text.split(": ");
//         if (key && value) {
//           hospitalData[key.toLowerCase()] = value;
//         }
//       }
//     });

//     return hospitalData;
//   };

//   //   const tokens = marked.lexer(markdown);
//   //   const hospitalData: { [key: string]: string } = {};

//   //   tokens.forEach((token) => {
//   //     if (token.type === "heading" && token.depth === 3) {
//   //       hospitalData["name"] = token.text;
//   //     } else if (token.type === "heading" && token.depth === 4) {
//   //       if (token.text.startsWith("Address")) {
//   //         hospitalData["address"] = token.text.replace("Address: ", "");
//   //       } else if (token.text.startsWith("Phone")) {
//   //         hospitalData["phone"] = token.text.replace("Phone: ", "");
//   //       }
//   //     } else if (token.type === "paragraph") {
//   //       const [key, value] = token.text.split(": ");
//   //       if (key && value) {
//   //         hospitalData[key.toLowerCase()] = value;
//   //       }
//   //     }
//   //   });

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       const parsedData = parseMarkdown(markdown);
//       const hospitalRef = collection(firestore, "hospitals");
//       await addDoc(hospitalRef, parsedData);
//       setMarkdown("");
//       setError(null);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   // return (
//   //   <>
//   //     <AdminNavbar />
//   //     <main className="mt-10">
//   //       <div className=" text-neutral-800">
//   //         <h1>Admin Page</h1>
//   //         <form onSubmit={handleSubmit}>
//   //           <label>
//   //             Name:
//   //             <input
//   //               type="text"
//   //               value={name}
//   //               onChange={(e) => setName(e.target.value)}
//   //             />
//   //           </label>
//   //           <br />
//   //           <label>
//   //             Address:
//   //             <input
//   //               type="text"
//   //               value={address}
//   //               onChange={(e) => setAddress(e.target.value)}
//   //             />
//   //           </label>
//   //           <br />
//   //           <label>
//   //             Phone:
//   //             <input
//   //               type="text"
//   //               value={phone}
//   //               onChange={(e) => setPhone(e.target.value)}
//   //             />
//   //           </label>
//   //           <br />
//   //           <label>
//   //             State:
//   //             <select value={state} onChange={(e) => setState(e.target.value)}>
//   //               <option value="">Select State</option>
//   //               {states.map((state) => (
//   //                 <option key={state} value={state}>
//   //                   {state}
//   //                 </option>
//   //               ))}
//   //             </select>
//   //           </label>
//   //           <br />
//   //           <label>
//   //             Local Government:
//   //             <select
//   //               value={lga}
//   //               onChange={(e) => setLga(e.target.value)}
//   //               disabled={!state}
//   //             >
//   //               <option value="">Select Local Government</option>
//   //               {lgas.map((lga) => (
//   //                 <option key={lga} value={lga}>
//   //                   {lga}
//   //                 </option>
//   //               ))}
//   //             </select>
//   //           </label>
//   //           <br />
//   //           <button type="submit">Create Hospital</button>
//   //         </form>
//   //         {error && <p style={{ color: "red" }}>{error}</p>}
//   //       </div>
//   //     </main>
//   //   </>
//   // );
//   return (
//     <>
//       <AdminNavbar />
//       <main className="mt-10">
//         <div className="text-neutral-800">
//           <h1>Admin Page</h1>
//           <form onSubmit={handleSubmit}>
//             <label>
//               Hospital Details (Markdown)
//               <textarea
//                 value={markdown}
//                 onChange={(e) => setMarkdown(e.target.value)}
//                 rows={10}
//                 cols={50}
//                 className="border"
//               />
//             </label>
//             <br />
// <label>
//   State:
//   <select
//     value={state}
//     onChange={(e) => setState(e.target.value)}
//     className="border"
//   >
//     <option value="">Select State</option>
//     {states.map((state) => (
//       <option key={state} value={state}>
//         {state}
//       </option>
//     ))}
//   </select>
// </label>
// <br />
// <label>
//   Local Government:
//   <select
//     value={lgas.length > 0 ? lgas[0] : ""}
//     onChange={(e) => setLgas([e.target.value])}
//     disabled={!state}
//     className="border"
//   >
//     <option value="">Select Local Government</option>
//     {lgas.map((lga) => (
//       <option key={lga} value={lga}>
//         {lga}
//       </option>
//     ))}
//   </select>
// </label>
//             <br />
//             <button
//               type="submit"
//               className="bg-blue-500 text-white p-2 rounded"
//             >
//               Create Hospital
//             </button>
//           </form>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//         </div>
//       </main>
//     </>
//   );
// };
// export default AdminPage;

"use client";
import React, { useEffect, useState } from "react";
import { marked } from "marked";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "@/app/firebase/config";
import { fetchStates } from "@/app/lib/fetchStates";
import { fetchLga } from "@/app/lib/fetchLga";
import { getErrorMessage } from "@/utils/errorHandler";
import Link from "next/link";

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState("");
  const [lga, setLga] = useState("");
  const [lgas, setLgas] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState<string>("");
  const [hospitalId, setHospitalId] = useState<string | null>(null);

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

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
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
      parsedData.lga = lgas[0];
      const hospitalRef = collection(firestore, "hospitals");
      await addDoc(hospitalRef, parsedData);
      setMarkdown("");
      setState("");
      setLgas([]);
      setError(null);
      setHospitalName(parsedData.name);
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

  const parseMarkdown = (markdown: string) => {
    const tokens = marked.lexer(markdown);
    const hospitalData: { [key: string]: string } = {};

    tokens.forEach((token) => {
      if (token.type === "heading") {
        hospitalData["name"] = token.text;
      } else if (token.type === "heading") {
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

  

  
  return (
    <div className=" w-full h-screen flex flex-col items-center justify-center gap-10">
      <h1 className="text-[2rem] font-semibold mb-5 text-neutral-500">
        Create New Hospital
      </h1>
      <div className=" flex flex-col  items-start gap-3 rounded-xl  ">
        <button
          onClick={handleInsertTemplate}
          className=" text-primary-dark hover:underline"
        >
          Insert Template
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={markdown}
            onChange={handleMarkdownChange}
            placeholder="Enter hospital details"
            rows={5}
            cols={40}
            className="bg-neutral-100 p-5 rounded-lg border resize-none outline-none"
          />

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="input"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={lgas.length > 0 ? lgas[0] : ""}
            onChange={(e) => setLgas([e.target.value])}
            disabled={!state}
            className="input"
          >
            <option value="">Select Local Government</option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
          <div className=" flex w-full items-center justify-between gap-5">
            <button type="submit" className="auth-btn w-full mt-5">
              Save
            </button>
            <Link href="/admin">
              <button type="submit" className="w-full mt-5 auth-btn_outline">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default MarkdownEditor;
