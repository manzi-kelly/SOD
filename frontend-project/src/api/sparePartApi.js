import API from "./base";

// ======================
// ✅ GET ALL SPARE PARTS
// ======================
export const getSpareParts = () => {
  return API.get("/sparepart");
};

// ======================
// ✅ ADD SPARE PART
// ======================
export const addSparePart = (data) => {
  return API.post("/sparepart", data);
};

// ======================
// ✅ UPDATE SPARE PART
// ======================
export const updateSparePart = (id, data) => {
  return API.put(`/sparepart/${id}`, data);
};

// ======================
// ✅ DELETE SPARE PART
// ======================
export const deleteSparePart = (id) => {
  return API.delete(`/sparepart/${id}`);
};