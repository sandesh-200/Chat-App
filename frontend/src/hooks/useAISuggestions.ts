import { useState } from "react";
import { getAISuggestions } from "@/api/ai";

export const useAISuggestions = (chatId?: string) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  const fetchSuggestions = async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      setShow(true);
      const data = await getAISuggestions(chatId);
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error("AI Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, show, setShow, fetchSuggestions };
};
