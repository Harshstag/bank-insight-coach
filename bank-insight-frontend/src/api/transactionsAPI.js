import axios from "axios";

export const uploadCsvApi = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("http://localhost:8080/api/transactions/upload", formData);
};
