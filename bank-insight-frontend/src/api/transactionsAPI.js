import axios from "axios";

export const uploadCsvApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("/api/transactions/upload", formData);
};
