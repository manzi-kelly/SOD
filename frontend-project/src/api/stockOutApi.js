import API from "./base";

export const addStockOut = (data) =>
  API.post("/stockout", data);

export const getStockOut = () =>
  API.get("/stockout");

export const deleteStockOut = (id) =>
  API.delete(`/stockout/${id}`);