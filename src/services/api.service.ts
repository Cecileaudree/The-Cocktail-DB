import axios from "axios";
import { ApiResponse, Character } from "../types/api.type";

const apiClient = axios.create({
  baseURL: "https://rickandmortyapi.com/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  console.log(`${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}`);
    } else {
      console.error("Network error");
    }

    return Promise.reject(error);
  },
);

export const getCharacters = async (page: number) => {
  const response = await apiClient.get<ApiResponse<Character>>(
    `character?page=${page}`
  );
  return response.data;
};

// 🔹 récupérer un personnage par ID
export const getItemById = async (id: number): Promise<Character> => {
  const response = await apiClient.get<Character>(`character/${id}`);
  return response.data;
};

export default apiClient;
