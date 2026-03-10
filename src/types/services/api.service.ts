import axios from "axios";

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
export default apiClient;
