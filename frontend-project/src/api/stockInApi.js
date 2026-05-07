import API from "./base";

// ======================
// ✅ ADD STOCK IN
// ======================
export const addStockIn = (data) => {
  return API.post("/stockin", {
    sparePartId: data.sparePartId,
    quantity: data.quantity,
    date: data.date
  });
};

// ======================
// ✅ GET STOCK IN
// ======================
export const getStockIn = () => {
  return API.get("/stockin");
};

// ======================
// ✅ UPDATE STOCK IN
// ======================
export const updateStockIn = (id, data) => {
  return API.put(`/stockin/${id}`, {
    quantity: data.quantity,
    date: data.date
  });
};

// ======================
// ✅ DELETE STOCK IN
// ======================
export const deleteStockIn = (id) => {
  return API.delete(`/stockin/${id}`);
};