import api from "./axios_config";

export const registerUser = async (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/user/register", data);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth/user/login", data);
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};
