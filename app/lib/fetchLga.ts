export const fetchLga = async (state: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://nga-states-lga.onrender.com/?state=${state}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch towns");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching towns:", error);
    return [];
  }
};
