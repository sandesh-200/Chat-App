import api from "./axios_config";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UsersApiResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const getAllUsers = async (
  page = 1,
  limit = 10,
): Promise<UsersApiResponse> => {
  try {
    const { data } = await api.get(`/users?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
