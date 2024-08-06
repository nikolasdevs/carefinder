export const fetchStates = async (): Promise<string[]> => {
  try {
    const response = await fetch("https://nga-states-lga.onrender.com/fetch");
    if (!response.ok) {
      throw new Error("Failed to fetch states");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
};

