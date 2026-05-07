import API from "./base";

// LOGIN USER
export const loginUser = (data) => {
  return API.post("/login", data);
};