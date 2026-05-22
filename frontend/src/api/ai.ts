import api from "./axios_config";



export const getAISuggestions = async (conversationId: string) => {
  try {
    const { data } = await api.post("/ai/suggest-reply", {
      conversationId,
    });

    return data;
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    throw error;
  }
};
