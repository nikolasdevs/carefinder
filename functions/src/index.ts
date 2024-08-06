// /**
//  * Import function triggers from their respective submodules:
//  *
//  * import {onCall} from "firebase-functions/v2/https";
//  * import {onDocumentWritten} from "firebase-functions/v2/firestore";
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// // import {onRequest} from "firebase-functions/v2/https";
// // import * as logger from "firebase-functions/logger";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// // export const helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });

// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// import fetch from "node-fetch";

// interface Hospital {
//   name: string;
//   address: string;
//   phone: string;
//   [key: string]: any; // Optional: if there are additional properties
// }
// admin.initializeApp();

// const db = admin.firestore();
// const apiEndpoint = "https://api.reliancehmo.com/v3/providers"; // Replace with your API endpoint

// export const fetchAndStoreHospitals = functions.https.onRequest(
//   async (req, res) => {
//     try {
//       const response = await fetch(apiEndpoint);
//       if (!response.ok) {
//         throw new Error("Failed to fetch data");
//       }

//       const data = (await response.json()) as Hospital[];

//       const batch = db.batch();
//       const hospitalsRef = db.collection("hospitals");

//       data.forEach((hospital: any) => {
//         if (hospital.name && hospital.address && hospital.phone) {
//           const docRef = hospitalsRef.doc(); // Auto-generated document ID
//           batch.set(docRef, hospital);
//         }
//       });

//       await batch.commit();

//       res.status(200).send("Data imported successfully");
//     } catch (error) {
//       console.error("Error importing data:", error);
//       res.status(500).send("Failed to import data");
//     }
//   }
// );

// export const deleteHospitals = functions.https.onRequest(async (req, res) => {
//   try {
//     const hospitalsRef = db.collection("hospitals");
//     const snapshot = await hospitalsRef.get();

//     const batch = db.batch();
//     snapshot.docs.forEach((doc) => {
//       batch.delete(doc.ref);
//     });
//     await batch.commit();
//     res.status(200).send("Hospitals deleted successfully");
//   } catch (error) {
//     console.error("Error deleting hospitals:", error);
//     res.status(500).send("Failed to delete hospitals");
//   }
// });

// export const fetchHospitals = functions.https.onRequest(async (req, res) => {
//   try {
//     const hospitalsRef = db.collection("hospitals");
//     const snapshot = await hospitalsRef.get();
//     const hospitals = snapshot.docs.map((doc) => doc.data());
//     res.status(200).send(hospitals);
//   } catch (error) {
//     console.error("Error fetching hospitals:", error);
//     res.status(500).send("Failed to fetch hospitals");
//   }
// });
