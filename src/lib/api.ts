import axios from "axios";
import { getCustomerToken, logoutCustomer } from "./customerAuth";

const api = axios.create({
  baseURL: "http://localhost:5555/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use((config) => {
  const token = getCustomerToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logoutCustomer();
    }

    return Promise.reject(error);
  }
);

export default api;
