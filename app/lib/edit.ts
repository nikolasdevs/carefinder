import { deleteDoc, doc, getDoc, updateDoc } from "@firebase/firestore";
import { firestore } from "../firebase/config";

// Edit details of hospital and save back into Firestore
const editHospitalDetails = async (
  hospitalId: string,
  updatedData: { [key: string]: any }
) => {
  try {
    // Reference to the hospital document
    const hospitalRef = doc(firestore, "hospitals", hospitalId);

    // Fetch the existing hospital data
    const hospitalDoc = await getDoc(hospitalRef);
    if (!hospitalDoc.exists()) {
      throw new Error("Hospital not found");
    }

    // Update the hospital data
    await updateDoc(hospitalRef, updatedData);

    console.log("Hospital details updated successfully");
  } catch (error) {
    console.error("Error updating hospital details: ", error);
  }
};

// Delete hospital from Firestore
const deleteHospital = async (hospitalId: string) => {
  try {
    // Reference to the hospital document
    const hospitalRef = doc(firestore, "hospitals", hospitalId);

    // Delete the hospital document
    await deleteDoc(hospitalRef);
    console.log("Hospital deleted successfully");
  } catch (error) {
    console.error("Error deleting hospital: ", error);
  }
};

// Example usage
const hospitalId = "exampleHospitalId";
const updatedData = {
  name: "Updated Hospital Name",
  address: "Updated Address",
  phone: "Updated Phone Number",
  description: "Updated Description",
};

editHospitalDetails(hospitalId, updatedData);

// To delete a hospital
deleteHospital(hospitalId);
